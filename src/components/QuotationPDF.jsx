import { calcItemTotal, calcSubtotal, calcTax, calcGrandTotal, formatCurrency } from '../lib/calc'

const th = { padding: '5px 8px', textAlign: 'left', border: '1px solid #cbd5e1', fontWeight: '600', background: '#1e3a8a', color: '#fff', fontSize: '11px' }
const td = { padding: '5px 8px', border: '1px solid #e2e8f0', fontSize: '11px' }

function Stamp({ company = '馬尼行動通訊' }) {
  return (
    <svg width="136" height="100" viewBox="0 0 160 120" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <path id="nameArc" d="M 6,60 A 74,54 0 0,0 154,60" />
        <path id="starArc" d="M 18,60 A 62,45 0 0,1 142,60" />
      </defs>
      <ellipse cx="80" cy="60" rx="77" ry="57" fill="rgba(185,0,0,0.04)" stroke="#b91c1c" strokeWidth="2.5" />
      <ellipse cx="80" cy="60" rx="68" ry="48" fill="none" stroke="#b91c1c" strokeWidth="1" />
      <text fontSize="11" fontFamily="Microsoft JhengHei, PingFang TC, Arial, sans-serif" fontWeight="bold" fill="#b91c1c" letterSpacing="2">
        <textPath href="#nameArc" startOffset="25%">{company}</textPath>
      </text>
      <line x1="16" y1="60" x2="144" y2="60" stroke="#b91c1c" strokeWidth="0.8" />
      <text x="80" y="52" textAnchor="middle" fontSize="13" fontFamily="Microsoft JhengHei, PingFang TC, Arial, sans-serif" fontWeight="bold" fill="#b91c1c" letterSpacing="4">報 價</text>
      <text x="80" y="73" textAnchor="middle" fontSize="12" fontFamily="Microsoft JhengHei, PingFang TC, Arial, sans-serif" fontWeight="bold" fill="#b91c1c" letterSpacing="2">專 用 章</text>
      <text fontSize="8" fontFamily="serif" fill="#b91c1c">
        <textPath href="#starArc" startOffset="14%">★  ★  ★  ★  ★</textPath>
      </text>
    </svg>
  )
}

function InfoRow({ label, value }) {
  if (!value) return null
  return (
    <div style={{ display: 'flex', gap: '4px', fontSize: '11px', marginBottom: '2px' }}>
      <span style={{ color: '#64748b', minWidth: '44px', flexShrink: 0 }}>{label}：</span>
      <span>{value}</span>
    </div>
  )
}

export default function QuotationPDF({ quotation, items, settings }) {
  const {
    client_name, client_tax_id, client_contact, client_phone, client_mobile,
    client_fax, client_email, client_address,
    number, date, valid_days, show_cash, show_card, tax_rate, notes,
    buyer_name, buyer_address, buyer_phone,
  } = quotation

  const co = settings ?? {}

  const cashSub = calcSubtotal(items, 'cash_price')
  const cardSub = calcSubtotal(items, 'card_price')
  const primarySub = show_cash ? cashSub : cardSub
  const tax = calcTax(primarySub, tax_rate)
  const total = calcGrandTotal(primarySub, tax)
  const MIN_ROWS = 10
  const displayRows = [...items, ...Array(Math.max(0, MIN_ROWS - items.length)).fill(null)]

  const hasBankInfo = co.bank_name || co.bank_account

  return (
    <div style={{ width: '794px', padding: '36px 48px', fontFamily: 'Microsoft JhengHei, PingFang TC, Arial, sans-serif', fontSize: '12px', color: '#1e293b', background: '#fff' }}>

      {/* ── 頂部：LOGO + 標題 ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', paddingBottom: '14px', borderBottom: '2px solid #1e3a8a' }}>
        <div>
          <img src="/logo.png" style={{ height: '48px', marginBottom: '8px', objectFit: 'contain', display: 'block' }} alt="logo" />
          <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{co.name || '馬尼行動通訊'}</div>
          {co.phone && <div style={{ fontSize: '11px', color: '#555' }}>電話：{co.phone}</div>}
          {co.address && <div style={{ fontSize: '11px', color: '#555' }}>地址：{co.address}</div>}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', letterSpacing: '8px', color: '#1e3a8a', marginBottom: '8px' }}>報 價 單</div>
          <div style={{ fontSize: '12px', color: '#444', lineHeight: '1.9' }}>
            <div>單號：<strong>{number}</strong></div>
            <div>日期：{date}</div>
            <div>有效期限：<strong>{valid_days} 天</strong></div>
          </div>
        </div>
      </div>

      {/* ── 雙方資訊 ── */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
        {/* 我方 */}
        <div style={{ flex: 1, border: '1px solid #e2e8f0', borderRadius: '4px', padding: '10px 12px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '12px', color: '#1e3a8a', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', marginBottom: '6px' }}>報價方</div>
          <InfoRow label="公司" value={co.name || '馬尼行動通訊'} />
          <InfoRow label="聯絡人" value={co.contact} />
          <InfoRow label="電話" value={co.phone} />
          <InfoRow label="手機" value={co.mobile} />
          <InfoRow label="Email" value={co.email} />
          <InfoRow label="地址" value={co.address} />
          <InfoRow label="統編" value={co.tax_id} />
        </div>
        {/* 客戶 */}
        <div style={{ flex: 1, border: '1px solid #e2e8f0', borderRadius: '4px', padding: '10px 12px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '12px', color: '#1e3a8a', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', marginBottom: '6px' }}>客戶方</div>
          <InfoRow label="公司" value={client_name} />
          <InfoRow label="聯絡人" value={client_contact} />
          <InfoRow label="電話" value={client_phone} />
          <InfoRow label="手機" value={client_mobile} />
          <InfoRow label="傳真" value={client_fax} />
          <InfoRow label="Email" value={client_email} />
          <InfoRow label="地址" value={client_address} />
          <InfoRow label="統編" value={client_tax_id} />
        </div>
      </div>

      {/* ── 明細表 ── */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px' }}>
        <thead>
          <tr>
            <th style={{ ...th, width: '24px', textAlign: 'center' }}>#</th>
            <th style={{ ...th, width: '160px' }}>品名</th>
            <th style={th}>規格</th>
            <th style={{ ...th, width: '40px', textAlign: 'center' }}>數量</th>
            <th style={{ ...th, width: '32px', textAlign: 'center' }}>單位</th>
            {show_cash && <><th style={{ ...th, textAlign: 'right' }}>現金單價</th><th style={{ ...th, textAlign: 'right' }}>現金總價</th></>}
            {show_card && <><th style={{ ...th, textAlign: 'right' }}>刷卡單價</th><th style={{ ...th, textAlign: 'right' }}>刷卡總價</th></>}
          </tr>
        </thead>
        <tbody>
          {displayRows.map((item, idx) => (
            <tr key={idx} style={{ background: idx % 2 === 0 ? '#fff' : '#f8fafc' }}>
              <td style={{ ...td, textAlign: 'center', color: '#94a3b8' }}>{idx + 1}</td>
              <td style={td}>{item?.product_name ?? ''}</td>
              <td style={{ ...td, color: '#64748b' }}>{item?.spec ?? ''}</td>
              <td style={{ ...td, textAlign: 'center' }}>{item?.qty ?? ''}</td>
              <td style={{ ...td, textAlign: 'center' }}>{item?.unit ?? ''}</td>
              {show_cash && (
                <>
                  <td style={{ ...td, textAlign: 'right' }}>{item ? formatCurrency(item.cash_price) : ''}</td>
                  <td style={{ ...td, textAlign: 'right', fontWeight: item ? '600' : 'normal' }}>{item ? formatCurrency(calcItemTotal(item.qty, item.cash_price)) : ''}</td>
                </>
              )}
              {show_card && (
                <>
                  <td style={{ ...td, textAlign: 'right' }}>{item ? formatCurrency(item.card_price) : ''}</td>
                  <td style={{ ...td, textAlign: 'right', fontWeight: item ? '600' : 'normal' }}>{item ? formatCurrency(calcItemTotal(item.qty, item.card_price)) : ''}</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* ── 合計 ── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
        <table style={{ fontSize: '12px', minWidth: '220px', borderCollapse: 'collapse' }}>
          <tbody>
            {show_cash && <tr>
              <td style={{ padding: '3px 10px', color: '#64748b', borderTop: '1px solid #e2e8f0' }}>現金小計</td>
              <td style={{ padding: '3px 10px', textAlign: 'right', borderTop: '1px solid #e2e8f0' }}>{formatCurrency(cashSub)}</td>
            </tr>}
            {show_card && <tr>
              <td style={{ padding: '3px 10px', color: '#64748b', borderTop: '1px solid #e2e8f0' }}>刷卡小計</td>
              <td style={{ padding: '3px 10px', textAlign: 'right', borderTop: '1px solid #e2e8f0' }}>{formatCurrency(cardSub)}</td>
            </tr>}
            {tax_rate > 0 && <tr>
              <td style={{ padding: '3px 10px', color: '#64748b', borderTop: '1px solid #e2e8f0' }}>稅額 ({tax_rate}%)</td>
              <td style={{ padding: '3px 10px', textAlign: 'right', borderTop: '1px solid #e2e8f0' }}>{formatCurrency(tax)}</td>
            </tr>}
            <tr style={{ background: '#1e3a8a', color: '#fff' }}>
              <td style={{ padding: '6px 10px', fontWeight: 'bold' }}>總計</td>
              <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 'bold' }}>{formatCurrency(total)} 元整</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── 匯款資訊 ── */}
      {hasBankInfo && (
        <div style={{ marginBottom: '12px', padding: '8px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '11px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#1e3a8a' }}>匯款資訊</div>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            {co.bank_name && <span>銀行：{co.bank_name}</span>}
            {co.bank_branch && <span>分行：{co.bank_branch}</span>}
            {co.bank_account && <span>帳號：{co.bank_account}</span>}
            {co.bank_account_name && <span>戶名：{co.bank_account_name}</span>}
          </div>
        </div>
      )}

      {/* ── 附記 ── */}
      {notes && (
        <div style={{ marginBottom: '12px', padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '11px', color: '#555' }}>
          附記：{notes}
        </div>
      )}

      {/* ── 簽章欄 ── */}
      <div style={{ display: 'flex', gap: '14px', marginTop: '14px', fontSize: '11px' }}>
        {[
          { title: '報價單位', lines: [co.name || '馬尼行動通訊', co.address ? `地址：${co.address}` : '', co.phone ? `電話：${co.phone}` : ''].filter(Boolean), stamp: true },
          { title: '採購單位', lines: [buyer_name || '　', buyer_address ? `地址：${buyer_address}` : '地址：', buyer_phone ? `電話：${buyer_phone}` : '電話：'] },
        ].map(box => (
          <div key={box.title} style={{ flex: 1, border: '1px solid #d1d5db', padding: '10px 12px', borderRadius: '4px', position: 'relative', minHeight: '110px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '6px', color: '#1e3a8a', borderBottom: '1px solid #e2e8f0', paddingBottom: '3px' }}>{box.title}</div>
            {box.lines.map((l, i) => <div key={i} style={{ marginBottom: '2px' }}>{l}</div>)}
            <div style={{ marginTop: '16px', color: '#94a3b8' }}>簽章：＿＿＿＿＿＿＿＿</div>
            {box.stamp && (
              <div style={{ position: 'absolute', right: '8px', bottom: '6px', opacity: 0.88, transform: 'rotate(-8deg)' }}>
                {co.stamp_image
                  ? <img src={co.stamp_image} style={{ width: '100px', height: '100px', objectFit: 'contain' }} alt="章" />
                  : <Stamp company={co.name || '馬尼行動通訊'} />
                }
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
