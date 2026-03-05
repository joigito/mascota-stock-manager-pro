import { Sale } from "@/types/sales";

export function generateSaleReceipt(sale: Sale, organizationName: string) {
  const dateStr = new Date(sale.date).toLocaleDateString("es-AR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const itemsRows = sale.items
    .map(
      (item) => `
      <tr>
        <td style="padding:6px 8px;border-bottom:1px solid #ddd;text-align:left;">
          ${item.productName}${item.variantInfo ? `<br><small style="color:#666;">${item.variantInfo}</small>` : ""}
        </td>
        <td style="padding:6px 8px;border-bottom:1px solid #ddd;text-align:center;">${item.quantity}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #ddd;text-align:right;">$${item.finalUnitPrice.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #ddd;text-align:right;">$${item.subtotal.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</td>
      </tr>`
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Comprobante X - ${organizationName}</title>
  <style>
    @media print {
      body { margin: 0; }
      .no-print { display: none; }
    }
    body {
      font-family: Arial, Helvetica, sans-serif;
      color: #222;
      max-width: 600px;
      margin: 0 auto;
      padding: 24px;
      font-size: 13px;
    }
    h1 { margin: 0; font-size: 18px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th { background: #f5f5f5; padding: 8px; font-size: 12px; text-transform: uppercase; letter-spacing: .5px; }
  </style>
</head>
<body>
  <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #222;padding-bottom:12px;margin-bottom:16px;">
    <div>
      <h1>${organizationName}</h1>
      <div style="margin-top:4px;font-size:12px;color:#666;">Comprobante de venta</div>
    </div>
    <div style="text-align:center;">
      <div style="font-size:36px;font-weight:bold;border:3px solid #222;width:48px;height:48px;line-height:48px;border-radius:4px;">X</div>
      <div style="font-size:10px;margin-top:2px;font-weight:bold;">NO VÁLIDO<br>COMO FACTURA</div>
    </div>
  </div>

  <div style="display:flex;justify-content:space-between;margin-bottom:16px;">
    <div><strong>Cliente:</strong> ${sale.customer}</div>
    <div><strong>Fecha:</strong> ${dateStr}</div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="text-align:left;">Producto</th>
        <th style="text-align:center;">Cant.</th>
        <th style="text-align:right;">P. Unit.</th>
        <th style="text-align:right;">Subtotal</th>
      </tr>
    </thead>
    <tbody>
      ${itemsRows}
    </tbody>
    <tfoot>
      <tr>
        <td colspan="3" style="padding:10px 8px;text-align:right;font-weight:bold;font-size:15px;border-top:2px solid #222;">TOTAL</td>
        <td style="padding:10px 8px;text-align:right;font-weight:bold;font-size:15px;border-top:2px solid #222;">$${sale.total.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</td>
      </tr>
    </tfoot>
  </table>

  <div style="margin-top:32px;text-align:center;font-size:11px;color:#888;border-top:1px solid #ddd;padding-top:12px;">
    Documento no válido como factura &mdash; Comprobante X
  </div>

  <div class="no-print" style="text-align:center;margin-top:24px;">
    <button onclick="window.print()" style="padding:10px 24px;font-size:14px;cursor:pointer;background:#222;color:#fff;border:none;border-radius:6px;">Imprimir</button>
  </div>
</body>
</html>`;

  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => printWindow.print();
  }
}
