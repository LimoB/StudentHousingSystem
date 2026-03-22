import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../../app/store";
import { getPaymentById, Payment } from "../../../api/payments";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { 
  ChevronLeft, 
  Receipt, 
  Calendar, 
  User, 
  Hash, 
  Info, 
  CheckCircle2, 
  Download, 
  ShieldCheck 
} from "lucide-react";

const PaymentDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const user = useSelector((state: RootState) => state.auth.user);
  const currentUserId = user?.userId || (user as any)?.id;

  useEffect(() => {
    const fetchSingle = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await getPaymentById(Number(id));
        
        if (Number(data.studentId) !== Number(currentUserId)) {
          setError("Access Denied: You do not have permission to view this receipt.");
        } else {
          setPayment(data);
        }
      } catch (err) {
        console.error("Failed to fetch payment details", err);
        setError("Payment record not found or server error.");
      } finally {
        setLoading(false);
      }
    };
    fetchSingle();
  }, [id, currentUserId]);

  /**
   * PDF GENERATOR
   * Creates an official M-Pesa Payment Voucher
   */
  const handleDownloadPDF = () => {
    if (!payment) return;

    const doc = new jsPDF();
    const dateStr = new Date(payment.createdAt).toLocaleDateString('en-GB', { 
      dateStyle: 'medium', 
      timeStyle: 'short' 
    });

    // Header Background
    doc.setFillColor(17, 24, 39); // Gray-900
    doc.rect(0, 0, 210, 50, 'F');
    
    // Header Text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("PAYMENT RECEIPT", 20, 30);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(156, 163, 175); // Gray-400
    doc.text(`Receipt ID: ${payment.mpesaReceiptNumber || 'N/A'}`, 20, 40);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, 150, 40);

    // Amount Section
    doc.setTextColor(31, 41, 55);
    doc.setFontSize(14);
    doc.text("Transaction Summary", 20, 65);

    autoTable(doc, {
      startY: 70,
      head: [['Description', 'Details']],
      body: [
        ['Payer Name', user?.fullName || 'N/A'],
        ['Phone Number', payment.phone],
        ['M-Pesa Receipt', payment.mpesaReceiptNumber || 'Processing'],
        ['Date & Time', dateStr],
        ['Status', payment.status.toUpperCase()],
        ['Amount Paid', `KSH ${Number(payment.amount).toLocaleString()}`],
        ['Checkout ID', payment.checkoutRequestID.substring(0, 20) + '...'],
      ],
      headStyles: { fillColor: [37, 99, 235] }, // Blue-600
      styles: { cellPadding: 6, fontSize: 11 },
    });

    // Footer
    const finalY = (doc as any).lastAutoTable.finalY || 160;
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text("Thank you for your payment. This is a computer-generated voucher.", 20, finalY + 20);
    doc.text("Official Digital Record - Verified by M-Pesa Daraja API", 20, finalY + 26);

    doc.save(`Receipt_${payment.mpesaReceiptNumber || payment.id}.pdf`);
  };

  if (loading) return (
    <div className="p-20 text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-400 font-bold">Verifying transaction...</p>
    </div>
  );

  if (error || !payment) return (
    <div className="p-20 text-center max-w-md mx-auto">
        <ShieldCheck size={48} className="mx-auto text-red-400 mb-4" />
        <h2 className="text-2xl font-black text-gray-900 mb-2">Unauthorized</h2>
        <p className="text-gray-500 mb-8">{error || "This payment record is unavailable."}</p>
        <button onClick={() => navigate("/student/payments")} className="bg-gray-900 text-white px-8 py-3 rounded-2xl font-bold hover:bg-black transition">
          Back to My History
        </button>
    </div>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-gray-500 font-bold hover:text-gray-900 transition bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm"
        >
          <ChevronLeft size={20} /> Back
        </button>
        
        <button 
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100"
        >
          <Download size={18} /> Download Receipt (PDF)
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden">
        <div className="bg-gray-900 p-10 text-white relative">
          <div className="absolute top-0 right-0 p-10 opacity-10">
            <Receipt size={120} />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
                <div className="bg-blue-500/20 p-2 rounded-lg">
                  <Receipt className="text-blue-400" size={24} />
                </div>
                <span className="text-blue-400 font-black uppercase tracking-[0.2em] text-xs text-nowrap">Official Payment Voucher</span>
            </div>
            <p className="text-gray-400 font-bold mb-1">Total Amount Paid</p>
            <h1 className="text-5xl font-black tracking-tight">Ksh {Number(payment.amount).toLocaleString()}</h1>
          </div>
          
          <div className="mt-8 flex items-center gap-3">
             <span className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${
                payment.status === 'paid' ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'
             }`}>
                Status: {payment.status}
             </span>
             <span className="text-gray-500 text-xs font-mono">DB-REF: {payment.id.toString().padStart(6, '0')}</span>
          </div>
        </div>

        <div className="p-10 grid md:grid-cols-2 gap-12 bg-white">
          <div className="space-y-10">
            <section className="flex gap-5">
              <div className="bg-blue-50 p-4 rounded-2xl h-fit text-blue-600"><Hash size={24} /></div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">M-Pesa Receipt</p>
                <p className="text-xl font-black text-gray-900 font-mono tracking-tight">{payment.mpesaReceiptNumber || "PENDING"}</p>
              </div>
            </section>

            <section className="flex gap-5">
              <div className="bg-blue-50 p-4 rounded-2xl h-fit text-blue-600"><Calendar size={24} /></div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Transaction Time</p>
                <p className="text-xl font-bold text-gray-900">
                    {new Date(payment.createdAt).toLocaleString('en-GB', { 
                      dateStyle: 'medium', 
                      timeStyle: 'short' 
                    })}
                </p>
              </div>
            </section>
          </div>

          <div className="space-y-10">
            <section className="flex gap-5">
              <div className="bg-blue-50 p-4 rounded-2xl h-fit text-blue-600"><User size={24} /></div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Payer Phone</p>
                <p className="text-xl font-bold text-gray-900">{payment.phone}</p>
                <p className="text-xs text-gray-400 font-medium">Verified M-Pesa Account</p>
              </div>
            </section>

            <section className="flex gap-5">
              <div className="bg-blue-50 p-4 rounded-2xl h-fit text-blue-600"><Info size={24} /></div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Network Reference</p>
                <p className="text-[10px] font-mono text-gray-400 break-all leading-relaxed uppercase">
                  {payment.checkoutRequestID}
                </p>
              </div>
            </section>
          </div>
        </div>

        <div className="bg-gray-50 p-8 border-t border-gray-100 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 text-green-600 font-black text-sm">
                <CheckCircle2 size={20} />
                <span className="uppercase tracking-widest text-center">Digitally Verified via M-Pesa Daraja</span>
            </div>
            <p className="text-[10px] text-gray-400 text-center max-w-sm leading-loose font-medium">
              Keep this for your records as proof of housing payment. Once confirmed, your lease status will be updated automatically.
            </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetail;