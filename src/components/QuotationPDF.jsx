import { calcItemTotal, calcSubtotal, calcTax, calcGrandTotal, formatCurrency } from '../lib/calc'

const th = { padding: '6px 8px', textAlign: 'left', border: '1px solid #d1d5db', fontWeight: '600', background: '#f9fafb' }
const td = { padding: '5px 8px', border: '1px solid #e5e7eb' }

export default function QuotationPDF({ quotation, items }) {
  const { client_name, client_tax_id, number, date, valid_days, show_cash, show_card, tax_rate, notes } = quotation

  const cashSub = calcSubtotal(items, 'cash_price')
  const cardSub = calcSubtotal(items, 'card_price')
  const primarySub = show_cash ? cashSub : cardSub
  const tax = calcTax(primarySub, tax_rate)
  const total = calcGrandTotal(primarySub, tax)
  const displayRows = [...items, ...Array(Math.max(0, 11 - items.length)).fill(null)]

  return (
    <div style={{ width: '794px', padding: '48px', fontFamily: 'Microsoft JhengHei, Arial, sans-serif', fontSize: '13px', color: '#111', background: '#fff' }}>
      {/* 標題 */}
      <div style={{ borderBottom: '2px solid #222', paddingBottom: '12px', marginBottom: '16px' }}>
        <div style={{ fontSize: '22px', fontWeight: 'bold', textAlign: 'center', letterSpacing: '8px', marginBottom: '10px' }}>
          報 價 單
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#444' }}>
          <div>
            <div style={{ fontWeight: 'bold' }}>馬尼企業有限公司</div>
            <div>地址：台南市東區東門路三段七號</div>
            <div>電話：06-2902237</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div>單號：{number}</div>
            <div>日期：{date}</div>
            <div>有效期限：{valid_days} 天</div>
          </div>
        </div>
      </div>

      {/* 客戶 */}
      <div style={{ marginBottom: '14px', fontSize: '13px' }}>
        客戶：<strong>{client_name}</strong>
        {client_tax_id && <span style={{ marginLeft: '32px' }}>統編：{client_tax_id}</span>}
      </div>

      {/* 明細表 */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '14px', fontSize: '12px' }}>
        <thead>
          <tr>
            <th style={{ ...th, width: '32px' }}>項目</th>
            <th style={{ ...th, width: '180px' }}>品名</th>
            <th style={th}>規格</th>
            <th style={{ ...th, width: '48px', textAlign: 'center' }}>數量</th>
            <th style={{ ...th, width: '40px', textAlign: 'center' }}>單位</th>
            {show_cash && <><th style={{ ...th, textAlign: 'right' }}>現金單價</th><th style={{ ...th, textAlign: 'right' }}>現金總價</th></>}
            {show_card && <><th style={{ ...th, textAlign: 'right' }}>刷卡單價</th><th style={{ ...th, textAlign: 'right' }}>刷卡總價</th></>}
          </tr>
        </thead>
        <tbody>
          {displayRows.map((item, idx) => (
            <tr key={idx}>
              <td style={{ ...td, textAlign: 'center' }}>{idx + 1}</td>
              <td style={td}>{item?.product_name ?? ''}</td>
              <td style={td}>{item?.spec ?? ''}</td>
              <td style={{ ...td, textAlign: 'center' }}>{item?.qty ?? ''}</td>
              <td style={{ ...td, textAlign: 'center' }}>{item?.unit ?? ''}</td>
              {show_cash && (
                <>
                  <td style={{ ...td, textAlign: 'right' }}>{item ? formatCurrency(item.cash_price) : ''}</td>
                  <td style={{ ...td, textAlign: 'right' }}>{item ? formatCurrency(calcItemTotal(item.qty, item.cash_price)) : ''}</td>
                </>
              )}
              {show_card && (
                <>
                  <td style={{ ...td, textAlign: 'right' }}>{item ? formatCurrency(item.card_price) : ''}</td>
                  <td style={{ ...td, textAlign: 'right' }}>{item ? formatCurrency(calcItemTotal(item.qty, item.card_price)) : ''}</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* 合計 */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '14px' }}>
        <table style={{ fontSize: '12px', minWidth: '220px' }}>
          <tbody>
            {show_cash && <tr><td style={{ padding: '2px 8px', color: '#555' }}>現金小計</td><td style={{ padding: '2px 8px', textAlign: 'right' }}>{formatCurrency(cashSub)}</td></tr>}
            {show_card && <tr><td style={{ padding: '2px 8px', color: '#555' }}>刷卡小計</td><td style={{ padding: '2px 8px', textAlign: 'right' }}>{formatCurrency(cardSub)}</td></tr>}
            {tax_rate > 0 && <tr><td style={{ padding: '2px 8px', color: '#555' }}>稅額 ({tax_rate}%)</td><td style={{ padding: '2px 8px', textAlign: 'right' }}>{formatCurrency(tax)}</td></tr>}
            <tr style={{ borderTop: '2px solid #333', fontWeight: 'bold' }}>
              <td style={{ padding: '4px 8px' }}>總計</td>
              <td style={{ padding: '4px 8px', textAlign: 'right' }}>{formatCurrency(total)} 元整</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 附記 */}
      {notes && <div style={{ fontSize: '12px', color: '#555', marginBottom: '20px' }}>附記：{notes}</div>}

      {/* 簽章欄 */}
      <div style={{ display: 'flex', gap: '24px', marginTop: '28px', fontSize: '12px' }}>
        {[
          { title: '報價單位', lines: ['馬尼企業有限公司', '地址：台南市東區東門路三段七號', '電話：06-2902237'] },
          { title: '採購單位', lines: ['單位：', '地址：', '電話：'] },
        ].map(box => (
          <div key={box.title} style={{ flex: 1, border: '1px solid #ccc', padding: '12px', borderRadius: '4px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>{box.title}</div>
            {box.lines.map((l, i) => <div key={i}>{l}</div>)}
            <div style={{ marginTop: '20px' }}>簽章：＿＿＿＿＿＿＿</div>
          </div>
        ))}
      </div>
    </div>
  )
}
