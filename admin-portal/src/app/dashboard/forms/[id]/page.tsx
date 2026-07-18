"use client";

import { useState, useEffect } from 'react';
import { useConfirm } from '@/components/ui/ConfirmProvider';
import { supabase } from '@database/connection/supabase-admin';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, Calendar, Mail, FileText, ClipboardList, Trash2, Download } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';

export default function FormResponsesPage() {
  const { confirmAction } = useConfirm();
  const [form, setForm] = useState<any>(null);
  const [fields, setFields] = useState<any[]>([]);
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const id = params.id as string;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch form details
        const { data: formData, error: formError } = await supabase
          .from('custom_forms')
          .select('*')
          .eq('id', id)
          .single();
        if (formError) throw formError;
        setForm(formData);

        // Fetch fields
        const { data: fieldsData, error: fieldsError } = await supabase
          .from('custom_form_fields')
          .select('*')
          .eq('form_id', id)
          .order('order_index', { ascending: true });
        if (fieldsError) throw fieldsError;
        setFields(fieldsData || []);

        // Fetch responses
        const { data: responsesData, error: responsesError } = await supabase
          .from('custom_form_responses')
          .select('*')
          .eq('form_id', id)
          .order('submitted_at', { ascending: false });
        if (responsesError) throw responsesError;
        setResponses(responsesData || []);

      } catch (err: any) {
        console.error(err);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to load form responses' });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const handleDeleteResponse = async (responseId: string) => {
    if (!await confirmAction('Admin Verification Required', 'Are you sure you want to delete this response?', 'danger')) return;
    try {
      const { error } = await supabase.from('custom_form_responses').delete().eq('id', responseId);
      if (error) throw error;
      setResponses(responses.filter(r => r.id !== responseId));
      toast({ title: 'Success', description: 'Response deleted successfully.' });
    } catch (err: any) {
      console.error(err);
      toast({ variant: 'destructive', title: 'Error', description: err.message || 'Failed to delete response' });
    }
  };

  const handleDownloadExcel = () => {
    if (responses.length === 0) return;
    
    // Build CSV
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Headers
    const headers = ["Date Submitted", "Client Email", ...fields.map(f => f.label.replace(/,/g, ''))];
    csvContent += headers.join(",") + "\r\n";
    
    // Rows
    responses.forEach(response => {
      const row = [
        new Date(response.submitted_at).toLocaleDateString(),
        response.client_email || ''
      ];
      
      fields.forEach(field => {
        let answer = response.response_data[field.id];
        if (typeof answer === 'boolean') {
          answer = answer ? 'Yes' : 'No';
        }
        
        if (answer !== undefined && answer !== null) {
           let strAnswer = answer.toString().replace(/"/g, '""');
           if (strAnswer.includes(',') || strAnswer.includes('\\n')) {
             strAnswer = `"${strAnswer}"`;
           }
           row.push(strAnswer);
        } else {
           row.push('');
        }
      });
      csvContent += row.join(",") + "\r\n";
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${form.title.replace(/\\s+/g, '_')}_Responses.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!form) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500">
        <FileText size={48} className="mb-4 text-slate-300" />
        <h2 className="text-xl font-bold text-slate-700">Form not found</h2>
        <button onClick={() => router.push('/dashboard/forms')} className="mt-4 text-indigo-600 font-bold">Go Back</button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/dashboard/forms')}
            className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{form.title}</h1>
            <p className="text-sm font-medium text-slate-500">View and manage responses for this form.</p>
          </div>
        </div>
        <button
          onClick={handleDownloadExcel}
          disabled={responses.length === 0}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold text-sm tracking-wide transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
        >
          <Download size={16} /> Export to Excel (CSV)
        </button>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        {responses.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 bg-slate-50">
            <ClipboardList size={48} className="mb-4 text-slate-300" strokeWidth={1} />
            <p className="font-bold text-lg text-slate-600 mb-2">No responses yet</p>
            <p className="text-sm">When clients fill out this form, their responses will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Date Submitted</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Client Email</th>
                  {fields.map(field => (
                    <th key={field.id} className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 min-w-[150px]">
                      {field.label}
                    </th>
                  ))}
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {responses.map((response) => (
                  <tr key={response.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar size={14} className="text-slate-400" />
                        {new Date(response.submitted_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-indigo-600">
                        <Mail size={14} className="text-indigo-400" />
                        {response.client_email || 'N/A'}
                      </div>
                    </td>
                    {fields.map(field => {
                      const answer = response.response_data[field.id];
                      let displayAnswer = answer;
                      if (typeof answer === 'boolean') {
                        displayAnswer = answer ? 'Yes' : 'No';
                      }
                      return (
                        <td key={field.id} className="px-6 py-4 text-sm text-slate-700 font-medium">
                          {displayAnswer !== undefined && displayAnswer !== null ? displayAnswer.toString() : <span className="text-slate-300 italic">No answer</span>}
                        </td>
                      );
                    })}
                    <td className="px-6 py-4 text-right border-l border-slate-100">
                      <button 
                        onClick={() => handleDeleteResponse(response.id)}
                        className="text-rose-400 hover:text-rose-600 bg-rose-50 hover:bg-rose-100 p-2 rounded-lg transition-all"
                        title="Delete Response"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
