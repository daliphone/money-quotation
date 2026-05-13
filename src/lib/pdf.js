import { toPng } from 'html-to-image'
import jsPDF from 'jspdf'

export async function exportToPDF(elementId, filename) {
  const el = document.getElementById(elementId)
  if (!el) throw new Error(`找不到元素 #${elementId}`)

  const dataUrl = await toPng(el, {
    quality: 0.92,
    pixelRatio: 1.5,
    backgroundColor: '#ffffff',
  })

  const img = new Image()
  img.src = dataUrl
  await new Promise(r => { img.onload = r })

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = (img.height * pageWidth) / img.width
  pdf.addImage(dataUrl, 'PNG', 0, 0, pageWidth, pageHeight)
  pdf.save(filename)
}
