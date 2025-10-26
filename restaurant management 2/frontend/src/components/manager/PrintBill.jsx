import React, { useRef } from 'react';

const PrintBill = ({ bill, order, table }) => {
  const printRef = useRef();

  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write('<html><head><title>Bill #' + bill.id + '</title>');
    printWindow.document.write('<style>');
    printWindow.document.write(`
      body { font-family: Arial, sans-serif; padding: 20px; }
      .bill-container { max-width: 300px; margin: 0 auto; }
      .header { text-align: center; margin-bottom: 20px; }
      .header h1 { margin: 0; font-size: 24px; }
      .header p { margin: 5px 0; font-size: 12px; }
      .divider { border-top: 2px solid black; margin: 10px 0; }
      .bill-details { margin: 15px 0; font-size: 14px; }
      .bill-details div { display: flex; justify-content: space-between; margin: 5px 0; }
      table { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 14px; }
      th { text-align: left; border-bottom: 1px solid black; padding: 5px 0; }
      td { padding: 5px 0; border-bottom: 1px dashed #ccc; }
      .text-right { text-align: right; }
      .text-center { text-align: center; }
      .total { font-size: 18px; font-weight: bold; }
      .footer { text-align: center; font-size: 12px; margin-top: 20px; }
      @media print { .no-print { display: none; } }
    `);
    printWindow.document.write('</style></head><body>');
    printWindow.document.write(printRef.current.innerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const groupOrderItems = (items) => {
    const grouped = {};
    items.forEach(item => {
      if (grouped[item.name]) {
        grouped[item.name].quantity += 1;
      } else {
        grouped[item.name] = {
          name: item.name,
          price: item.price,
          quantity: 1
        };
      }
    });
    return Object.values(grouped);
  };

  const groupedItems = order?.items ? groupOrderItems(order.items) : [];
  const subtotal = bill.total_amount;
  const cgst = subtotal * 0.025;
  const sgst = subtotal * 0.025;
  const total = subtotal + cgst + sgst;

  return (
    <div>
      <button
        onClick={handlePrint}
        className='w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition'
      >
        🖨️ Print Bill
      </button>

      {/* Hidden print template */}
      <div style={{ display: 'none' }}>
        <div ref={printRef} className='bill-container'>
          {/* Header */}
          <div className='header'>
            <h1>Restaurant Manager</h1>
            <p>123 Food Street, City</p>
            <p>Phone: +91 1234567890</p>
            <p>GSTIN: 22AAAAA0000A1Z5</p>
          </div>

          <div className='divider'></div>
          <div style={{ textAlign: 'center', fontWeight: 'bold', margin: '10px 0' }}>
            TAX INVOICE
          </div>
          <div className='divider'></div>

          {/* Bill Details */}
          <div className='bill-details'>
            <div>
              <span>Bill No:</span>
              <span><strong>#{bill.id}</strong></span>
            </div>
            <div>
              <span>Table:</span>
              <span><strong>{table?.table_number || order?.table_id}</strong></span>
            </div>
            <div>
              <span>Date:</span>
              <span>{new Date(bill.created_at).toLocaleDateString()}</span>
            </div>
            <div>
              <span>Time:</span>
              <span>{new Date(bill.created_at).toLocaleTimeString()}</span>
            </div>
          </div>

          <div className='divider'></div>

          {/* Items */}
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th className='text-center'>Qty</th>
                <th className='text-right'>Price</th>
                <th className='text-right'>Amount</th>
              </tr>
            </thead>
            <tbody>
              {groupedItems.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.name}</td>
                  <td className='text-center'>{item.quantity}</td>
                  <td className='text-right'>₹{item.price.toFixed(2)}</td>
                  <td className='text-right'>₹{(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className='divider'></div>

          {/* Totals */}
          <div className='bill-details'>
            <div>
              <span>Subtotal:</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div>
              <span>CGST (2.5%):</span>
              <span>₹{cgst.toFixed(2)}</span>
            </div>
            <div>
              <span>SGST (2.5%):</span>
              <span>₹{sgst.toFixed(2)}</span>
            </div>
          </div>

          <div className='divider'></div>

          <div className='bill-details total'>
            <div>
              <span>TOTAL:</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>

          <div style={{ textAlign: 'center', margin: '15px 0', fontWeight: 'bold' }}>
            Payment Status: {bill.paid ? 'PAID ✓' : 'UNPAID ✗'}
          </div>

          <div className='divider'></div>

          <div className='footer'>
            <p><strong>Thank you for visiting!</strong></p>
            <p>Please visit again</p>
            <p style={{ marginTop: '10px' }}>*** This is a computer generated bill ***</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintBill;
