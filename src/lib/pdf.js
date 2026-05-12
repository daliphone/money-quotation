import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export async function exportToPDF(elementId, filename) {
  const el = document.getElementById(elementId)
  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
  })
  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = (canvas.height * pageWidth) / canvas.width
  pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight)
  pdf.save(filename)
}
