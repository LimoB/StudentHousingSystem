import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchMyLeases } from "../../../app/slices/leaseSlice";
import { RootState, AppDispatch } from "../../../app/store";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { 
  FileText, 
  Calendar, 
  CreditCard, 
  ArrowRight, 
  Download, 
  Home,
  CheckCircle2,
  Clock
} from "lucide-react";

const Leases: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { leases, loading, error } = useSelector((state: RootState) => state.leases);
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    dispatch(fetchMyLeases());
  }, [dispatch]);

  /**
   * PDF GENERATOR FUNCTION
   * Creates a formal lease certificate/summary
   */
  const generatePDF = (lease: any) => {
    const doc = new jsPDF();
    const dateStr = new Date().toLocaleDateString('en-GB');

    // Header - Blue accent
    doc.setFillColor(37, 99, 235); // Blue-600
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("LEASE AGREEMENT SUMMARY", 20, 25);
    
    doc.setFontSize(10);
    doc.text(`Generated on: ${dateStr}`, 160, 25);

    // Body Text Settings
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(14);
    doc.text("Agreement Details", 20, 55);

    // Table Data
    autoTable(doc, {
      startY: 60,
      head: [['Field', 'Information']],
      body: [
        ['Property Name', lease.unit?.property?.name || 'N/A'],
        ['Unit Number', lease.unit?.unitNumber || 'N/A'],
        ['Tenant Name', user?.fullName || 'N/A'],
        ['Lease Status', lease.status.toUpperCase()],
        ['Start Date', new Date(lease.startDate).toLocaleDateString('en-GB')],
        ['End Date', lease.endDate ? new Date(lease.endDate).toLocaleDateString('en-GB') : 'Ongoing'],
        ['Monthly Rent', `Ksh ${Number(lease.unit?.price || 0).toLocaleString()}`],
        ['Lease Reference', `LSE-${lease.id.toString().padStart(6, '0')}`],
      ],
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235] },
      margin: { left: 20, right: 20 }
    });

    // Footer
    const finalY = (doc as any).lastAutoTable.finalY || 150;
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(150, 150, 150);
    doc.text("This document serves as an official confirmation of the lease terms recorded in the system.", 20, finalY + 20);
    doc.text("Digitally Verified by Student Housing Management System", 20, finalY + 26);

    // Save PDF
    doc.save(`Lease_Agreement_Unit_${lease.unit?.unitNumber}.pdf`);
  };

  if (loading) return (
    <div className="p-20 text-center flex flex-col items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 mb-6"></div>
      <p className="text-gray-500 font-bold text-lg">Retrieving your agreements...</p>
    </div>
  );

  if (error) return (
    <div className="p-10 text-center bg-red-50 rounded-[2rem] mx-6 mt-6">
      <p className="text-red-600 font-bold">{error}</p>
    </div>
  );

  return (
    <div className="p-6 max-w-5xl mx-auto min-h-screen">
      <div className="flex flex-col mb-10">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">My Leases</h1>
        <p className="text-gray-500 font-medium">Manage your active rental agreements and housing documents.</p>
      </div>

      {leases.length === 0 ? (
        <div className="bg-white p-16 rounded-[3rem] text-center border-2 border-dashed border-gray-100 shadow-sm">
          <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText size={40} className="text-gray-300" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No active leases found</h2>
          <p className="text-gray-400 max-w-xs mx-auto">Once your booking payment is confirmed, your lease agreement will appear here.</p>
        </div>
      ) : (
        <div className="grid gap-8">
          {leases.map((lease: any) => (
            <div 
              key={lease.id} 
              className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden hover:border-blue-200 transition-all group"
            >
              <div className="flex flex-col md:flex-row">
                {/* Visual Accent */}
                <div className={`w-3 ${lease.status === 'active' ? 'bg-green-500' : 'bg-orange-400'}`} />
                
                <div className="p-10 flex-1">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-50 p-4 rounded-2xl text-blue-600">
                        <Home size={28} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-gray-900">
                          {lease.unit?.property?.name || "Residential Unit"}
                        </h2>
                        <p className="text-blue-600 font-bold tracking-wide uppercase">Unit {lease.unit?.unitNumber}</p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${
                      lease.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {lease.status === 'active' ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                      {lease.status}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-10">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Calendar size={14} />
                        <p className="text-[10px] uppercase font-black tracking-tighter">Start Date</p>
                      </div>
                      <p className="font-bold text-gray-800">
                        {new Date(lease.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Calendar size={14} />
                        <p className="text-[10px] uppercase font-black tracking-tighter">End Date</p>
                      </div>
                      <p className="font-bold text-gray-800">
                        {lease.endDate ? new Date(lease.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Ongoing'}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-gray-400">
                        <CreditCard size={14} />
                        <p className="text-[10px] uppercase font-black tracking-tighter">Monthly Fee</p>
                      </div>
                      <p className="font-black text-gray-900 text-lg">Ksh {Number(lease.unit?.price || 0).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-gray-50 gap-4">
                    <Link 
                      to={`/student/leases/${lease.id}`}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gray-900 text-white px-8 py-3 rounded-2xl font-bold hover:bg-blue-600 transition-all text-sm group-hover:shadow-lg"
                    >
                      View Full Details <ArrowRight size={16} />
                    </Link>
                    
                    <button 
                      onClick={() => generatePDF(lease)}
                      className="flex items-center gap-2 text-gray-400 font-bold hover:text-blue-600 transition text-xs uppercase tracking-widest"
                    >
                      <Download size={16} /> Download Agreement (PDF)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Leases;