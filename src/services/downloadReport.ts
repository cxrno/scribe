import { getReport, verifyReportUserOwnership } from "./reportService";
import { getAttachments } from "./attachmentService";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import axios from "axios";
import { jsPDF } from "jspdf";
import 'jspdf-autotable';


export default async function downloadReport(reportId: string) {
    if(!(await verifyReportUserOwnership(reportId))) {
        throw new Error("Unauthorized");
    }
    else {
        try {
            const report = await getReport(reportId);
            
    const attachments = await getAttachments(reportId);
    
    const zip = new JSZip();
    
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text(`Report: ${report.title || "Untitled"}`, 14, 20);
    doc.text('Report created by: ' , 14, 26);

    doc.setFontSize(12);
    doc.text(`Report ID: ${report.id}`, 14, 30);
    doc.text(`Created: ${new Date(report.created_at).toLocaleString()}`, 14, 36);
    doc.text(`Updated: ${new Date(report.updated_at).toLocaleString()}`, 14, 42);
    
    if (report.tags && report.tags.length > 0) {
      doc.text(`Tags: ${report.tags.join(', ')}`, 14, 48);
    }
    
    doc.text('Description:', 14, 56);
    const splitDescription = doc.splitTextToSize(report.description || "No description", 180);
    doc.text(splitDescription, 14, 62);
    
    let yPosition = 62 + (splitDescription.length * 6);
    
    if (attachments && attachments.length > 0) {
      yPosition += 10;
      doc.setFontSize(16);
      doc.text('Attachments', 14, yPosition);
      yPosition += 10;
      
      const mediaFolder = zip.folder("media");
      
      for (let i = 0; i < attachments.length; i++) {
        const attachment = attachments[i];
        
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        
        const startYPosition = yPosition;
        
        doc.setFontSize(14);
        doc.text(`Attachment ${i+1}: ${attachment.title || "Untitled"}`, 14, yPosition);
        yPosition += 6;
        
        doc.setFontSize(10);
        doc.text(`ID: ${attachment.id}`, 14, yPosition);
        yPosition += 5;
        doc.text(`Type: ${attachment.media_type}`, 14, yPosition);
        yPosition += 5;
        
        let textHeight = 16;
        
        if (attachment.description) {
          const splitAttachDesc = doc.splitTextToSize(`Description: ${attachment.description}`, 90);
          doc.text(splitAttachDesc, 14, yPosition);
          textHeight += (splitAttachDesc.length * 5);
          yPosition += (splitAttachDesc.length * 5);
        }
        
        if (attachment.media_url && attachment.media_url !== "null") {
          try {
            const response = await axios.get(attachment.media_url, { responseType: 'arraybuffer' });
            
            const fileExtension = getFileExtension(attachment.media_type, attachment.media_url);
            const fileName = `${attachment.title || "untitled"}_${attachment.media_type}${fileExtension}`;
            
            if (mediaFolder) {
              mediaFolder.file(fileName, response.data);
            } else {
              console.error("Media folder not found");
            }
            
            doc.text(`Media file: ${fileName}`, 14, yPosition);
            yPosition += 5;
            textHeight += 5;
            
            if (attachment.media_type === 'picture' || attachment.media_type === 'sketch') {
              try {
                const base64 = arrayBufferToBase64(response.data);
                const imgData = `data:image/jpeg;base64,${base64}`;
                
                const imageWidth = 75;
                const imageHeight = 45;
                const imageX = 120;
                const imageY = startYPosition;
                
                doc.addImage(imgData, 'JPEG', imageX, imageY, imageWidth, imageHeight, attachment.id, 'MEDIUM');
                
                doc.setFontSize(8);
                const captionText = attachment.title || "Untitled";
                const textWidth = doc.getStringUnitWidth(captionText) * 8 / doc.internal.scaleFactor;
                const captionX = imageX + (imageWidth - textWidth) / 2;
                doc.text(captionText, captionX, imageY + imageHeight + 5);
                
                if (imageHeight + 5 > textHeight) {
                  yPosition += (imageHeight + 5 - textHeight);
                }
              } catch (imgError) {
                console.error("Could not embed image in PDF:", imgError);
              }
            }
          } catch (error) {
            console.error(`Failed to download attachment ${attachment.id}:`, error);
            doc.text(`Media file: Could not download (error)`, 14, yPosition);
            yPosition += 5;
            textHeight += 5;
          }
        } else {
          doc.text(`Media file: None`, 14, yPosition);
          yPosition += 5;
          textHeight += 5;
        }
        
        yPosition += 10;
      }
    }
    
    const reportTitle = report.title || "report";
    const sanitizedTitle = reportTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const pdfOutput = doc.output('arraybuffer');
    zip.file(`${sanitizedTitle}-report.pdf`, pdfOutput);
    
    const zipBlob = await zip.generateAsync({ type: "blob" });
    
    saveAs(zipBlob, `${sanitizedTitle}-${reportId}.zip`);
    
    return true;
  } catch (error) {
            console.error("Error downloading report:", error);
            throw error;
        }
    }
}

function getFileExtension(mediaType: string, url: string): string {
  const urlExtension = url.split('.').pop()?.toLowerCase();
  if (urlExtension && urlExtension.length <= 5) {
    return `.${urlExtension}`;
  }
  
  switch (mediaType) {
    case 'picture':
      return '.jpg';
    case 'video':
      return '.mp4';
    case 'audio':
      return '.mp3';
    case 'sketch':
      return '.png';
    case 'document':
      return '.pdf';
    default:
      return '.bin';
  }
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
    