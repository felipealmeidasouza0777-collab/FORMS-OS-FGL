import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, MapPin, User, Car, CheckCircle2, 
  Loader2, ArrowRight, ArrowLeft, Send, Wifi, 
  Settings, Phone, Mail, Hash, AlertCircle
} from 'lucide-react';
import axios from 'axios';

// --- Types & Constants ---
interface FormData {
  name: string; 
  cpf: string; 
  email: string; 
  plate: string;
  phone: string; 
  cep: string; 
  address: string; 
  number: string;
  complement: string; 
  serviceType: string;
}

const STEPS = [
  { id: 1, title: 'Serviço', icon: Settings },
  { id: 2, title: 'Titular', icon: User },
  { id: 3, title: 'Veículo', icon: Car },
  { id: 4, title: 'Local', icon: MapPin },
];

export default function FGLServicePortal() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    name: '', cpf: '', email: '', plate: '', phone: '',
    cep: '', address: '', number: '', complement: '', serviceType: ''
  });
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Handlers ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Smart Masking Logic
    if (name === 'cpf') {
      formattedValue = value.replace(/\D/g, '')
        .replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
        .substring(0, 14);
    }
    if (name === 'phone') {
      formattedValue = value.replace(/\D/g, '')
        .replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
        .substring(0, 15);
    }
    if (name === 'plate') {
      formattedValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 7);
    }

    setFormData(prev => ({ ...prev, [name]: formattedValue }));
    if (error) setError(null);
  };

  const handleCEP = async (cepValue: string) => {
    const cleanCep = cepValue.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      try {
        const { data } = await axios.get(`https://viacep.com.br/ws/${cleanCep}/json/`);
        if (!data.erro) {
          setFormData(prev => ({ 
            ...prev, 
            address: `${data.logradouro}, ${data.bairro} - ${data.localidade}/${data.uf}` 
          }));
        }
      } catch (err) { 
        console.error("CEP Error"); 
      }
    }
  };

  const nextStep = () => {
    // Basic validation before moving forward
    if (step === 2 && (!formData.name || !formData.cpf || !formData.email || !formData.phone)) {
      setError('Por favor, preencha todos os dados do titular.');
      return;
    }
    if (step === 3 && !formData.plate) {
      setError('A placa do veículo é obrigatória.');
      return;
    }
    setStep(s => Math.min(s + 1, 4));
    setError(null);
  };
  
  const prevStep = () => {
    setStep(s => Math.max(s - 1, 1));
    setError(null);
  };

  const onSubmit = async () => {
    if (!acceptedTerms) {
      setError('Você deve confirmar a veracidade das informações.');
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      setSubmitted(true);
      
      const message = encodeURIComponent(
        `🛠️ *ORDEM DE SERVIÇO - FGL BRASIL*\n` +
        `----------------------------------\n` +
        `🔧 *SERVIÇO:* ${formData.serviceType.toUpperCase()}\n\n` +
        `👤 *CLIENTE:* ${formData.name}\n` +
        `📄 *CPF:* ${formData.cpf}\n` +
        `📧 *EMAIL:* ${formData.email}\n` +
        `📞 *WHATSAPP:* ${formData.phone}\n\n` +
        `🚗 *VEÍCULO:* ${formData.plate}\n\n` +
        `📍 *ENDEREÇO DE ATENDIMENTO:*\n` +
        `${formData.address}, Nº ${formData.number}\n` +
        `${formData.complement ? `Comp: ${formData.complement}\n` : ''}` +
        `📫 *CEP:* ${formData.cep}\n` +
        `----------------------------------\n` +
        `_Enviado via Portal Digital FGL_`
      );
      
      window.open(`https://wa.me/5511971000304?text=${message}`, '_blank');
    } catch (err: any) {
      console.error(err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Erro ao enviar ordem. Verifique sua conexão.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (submitted) return <SuccessView data={formData} />;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 antialiased selection:bg-orange-100">
      {/* Header Premium */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FF6600] rounded-xl flex items-center justify-center shadow-lg shadow-orange-200">
              <ShieldCheck className="text-white w-6 h-6" />
            </div>
            <h1 className="font-black text-xl tracking-tighter uppercase italic">FGL <span className="text-[#FF6600]">Brasil</span></h1>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Suporte 24h</span>
              <span className="text-sm font-bold text-slate-700">0800 750 5500</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-12 px-6">
        {/* Progress Stepper */}
        <div className="flex justify-between mb-16 relative">
          <div className="absolute top-5 left-0 w-full h-0.5 bg-slate-200 z-0" />
          {STEPS.map((s) => (
            <div key={s.id} className="relative z-10 flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 border-2 ${step >= s.id ? 'bg-[#FF6600] border-[#FF6600] text-white shadow-lg shadow-orange-200' : 'bg-white text-slate-300 border-slate-100'}`}>
                <s.icon size={18} />
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${step >= s.id ? 'text-[#FF6600]' : 'text-slate-400'}`}>{s.title}</span>
            </div>
          ))}
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 overflow-hidden border border-slate-100">
          <div className="p-8 md:p-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {step === 1 && (
                  <div className="space-y-6 text-center">
                    <h2 className="text-2xl font-black uppercase italic tracking-tight">O que você precisa?</h2>
                    <p className="text-slate-400 text-sm">Selecione o tipo de atendimento técnico</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                      {[
                        { label: 'Instalação', desc: 'Novo rastreador no veículo', icon: Send },
                        { label: 'Retirada', desc: 'Remoção de equipamento', icon: ArrowLeft },
                        { label: 'Manutenção', desc: 'Reparo ou troca de chip', icon: Settings }
                      ].map(item => (
                        <button
                          key={item.label}
                          onClick={() => { setFormData({ ...formData, serviceType: item.label }); nextStep(); }}
                          className={`p-8 rounded-2xl border-2 transition-all group flex flex-col items-center gap-4 ${formData.serviceType === item.label ? 'border-[#FF6600] bg-orange-50/50 scale-[1.02]' : 'border-slate-50 bg-slate-50/30 hover:border-orange-200'}`}
                        >
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${formData.serviceType === item.label ? 'bg-[#FF6600] text-white' : 'bg-white text-slate-300 group-hover:text-orange-300 shadow-sm'}`}>
                            <item.icon size={24} />
                          </div>
                          <div>
                            <span className={`block font-black uppercase text-xs tracking-[0.2em] mb-1 ${formData.serviceType === item.label ? 'text-orange-700' : 'text-slate-700'}`}>{item.label}</span>
                            <span className="text-[10px] text-slate-400 uppercase font-medium">{item.desc}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-8">
                    <div className="flex items-center gap-5 border-b border-slate-50 pb-6 mb-4">
                      <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 shadow-inner"><User size={28} /></div>
                      <div>
                        <h2 className="font-black text-xl uppercase italic tracking-tight">Dados do Titular</h2>
                        <p className="text-sm text-slate-500 font-medium">Informações obrigatórias para faturamento.</p>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-x-10 gap-y-8">
                      <CustomInput label="Nome Completo" name="name" value={formData.name} onChange={handleInputChange} icon={<User size={16}/>} placeholder="Nome do titular" />
                      <CustomInput label="CPF" name="cpf" value={formData.cpf} onChange={handleInputChange} icon={<Hash size={16}/>} placeholder="000.000.000-00" />
                      <CustomInput label="E-mail Corporativo/Pessoal" name="email" value={formData.email} onChange={handleInputChange} icon={<Mail size={16}/>} placeholder="email@exemplo.com" />
                      <CustomInput label="WhatsApp" name="phone" value={formData.phone} onChange={handleInputChange} icon={<Phone size={16}/>} placeholder="(11) 99999-9999" />
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-8">
                    <div className="flex items-center gap-5 border-b border-slate-50 pb-6 mb-4">
                      <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 shadow-inner"><Car size={28} /></div>
                      <div>
                        <h2 className="font-black text-xl uppercase italic tracking-tight">Veículo Alvo</h2>
                        <p className="text-sm text-slate-500 font-medium">Identifique o carro para o atendimento.</p>
                      </div>
                    </div>
                    <div className="max-w-md mx-auto space-y-10">
                      {/* COMPONENTE PLACA MERCOSUL REALISTA */}
                      <div className="w-full aspect-[3.1/1] bg-white border-[4px] border-slate-800 rounded-xl shadow-2xl overflow-hidden relative">
                        <div className="w-full h-[22%] bg-[#003399] flex items-center justify-between px-6">
                           <span className="text-white text-[11px] font-black tracking-widest">BRASIL</span>
                           <div className="flex items-center gap-1 opacity-80">
                             <div className="w-4 h-2.5 bg-white/20 rounded-sm" />
                             <div className="w-4 h-2.5 bg-white/20 rounded-sm" />
                           </div>
                        </div>
                        <div className="h-[78%] flex items-center justify-center bg-[#F1F1F1]">
                           <span className="text-6xl font-black tracking-[0.2em] text-slate-900 uppercase font-mono">
                             {formData.plate || 'ABC1D23'}
                           </span>
                        </div>
                        <div className="absolute bottom-1 right-3 opacity-10 text-[8px] font-black italic select-none">FGL SECURITY SYSTEM</div>
                      </div>

                      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        <CustomInput label="Digite a Placa" name="plate" value={formData.plate} onChange={handleInputChange} placeholder="ABC1D23" />
                      </div>
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-8">
                    <div className="flex items-center gap-5 border-b border-slate-50 pb-6 mb-4">
                      <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 shadow-inner"><MapPin size={28} /></div>
                      <div>
                        <h2 className="font-black text-xl uppercase italic tracking-tight">Onde estaremos?</h2>
                        <p className="text-sm text-slate-500 font-medium">Endereço de atendimento.</p>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                      <div className="md:col-span-1">
                        <CustomInput 
                          label="CEP" 
                          name="cep" 
                          value={formData.cep} 
                          maxLength={8}
                          onChange={(e: any) => { handleInputChange(e); handleCEP(e.target.value); }} 
                          placeholder="00000-000"
                        />
                      </div>
                      <div className="md:col-span-2">
                         <CustomInput label="Endereço (Auto)" name="address" value={formData.address} readOnly placeholder="Rua / Bairro" />
                      </div>
                      <CustomInput label="Número" name="number" value={formData.number} onChange={handleInputChange} placeholder="000" />
                      <div className="md:col-span-2">
                        <CustomInput label="Complemento" name="complement" value={formData.complement} onChange={handleInputChange} placeholder="Ponto de referência" />
                      </div>
                    </div>

                    {/* Terms & Conditions UI */}
                    <div className="mt-12 p-6 bg-slate-50 rounded-2xl border-2 border-slate-100/50 flex items-start gap-4 cursor-pointer hover:border-orange-200 transition-all" onClick={() => setAcceptedTerms(!acceptedTerms)}>
                      <div className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all ${acceptedTerms ? 'bg-[#FF6600] border-[#FF6600]' : 'bg-white border-slate-200'}`}>
                        {acceptedTerms && <CheckCircle2 className="text-white w-4 h-4" />}
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed font-bold">
                        Declaro que todas as informações acima são verdadeiras e estou ciente de que dados incorretos podem atrasar o agendamento da ordem de serviço técnico.
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {error && (
              <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="mt-8 p-4 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-3 rounded-xl border border-red-100">
                <AlertCircle size={16} />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Navigation */}
            <div className="mt-12 pt-10 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
              {step > 1 ? (
                <button onClick={prevStep} className="flex items-center gap-3 text-xs font-black text-slate-400 hover:text-slate-600 transition-all uppercase tracking-[0.2em] group">
                  <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Voltar
                </button>
              ) : <div />}

              <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-4">
                {step < 4 ? (
                  <button 
                    onClick={nextStep} 
                    disabled={step === 1 && !formData.serviceType}
                    className="w-full sm:w-auto bg-slate-900 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-[#FF6600] active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-20 shadow-xl shadow-slate-200 hover:shadow-orange-100"
                  >
                    Próximo <ArrowRight size={18} />
                  </button>
                ) : (
                  <button 
                    onClick={onSubmit}
                    disabled={loading}
                    className="w-full sm:w-auto bg-[#FF6600] text-white px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-900 active:scale-95 transition-all flex items-center justify-center gap-4 shadow-2xl shadow-orange-200"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : <><Send size={18} /> Finalizar & Enviar</>}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="text-center py-12 px-6">
        <div className="flex items-center justify-center gap-3 opacity-20 mb-4">
           <Wifi size={14} />
           <div className="w-4 h-0.5 bg-slate-400" />
           <Hash size={14} />
        </div>
        <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">FGL Rastreamento & Monitoramento © Soluções em Telemetria Avançada</p>
      </footer>
    </div>
  );
}

// --- Components Auxiliares ---

function CustomInput({ label, icon, ...props }: any) {
  return (
    <div className="space-y-2">
      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">{label}</label>
      <div className="relative flex items-center">
        {icon && <div className="absolute left-5 text-slate-300">{icon}</div>}
        <input 
          {...props} 
          className={`w-full bg-slate-50 border-2 border-slate-100/50 rounded-2xl py-4 px-6 ${icon ? 'pl-14' : ''} outline-none focus:border-[#FF6600] focus:bg-white transition-all text-sm font-bold text-slate-700 placeholder:text-slate-200 shadow-sm`}
        />
      </div>
    </div>
  );
}

function SuccessView({ data }: { data: FormData }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-white flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full">
        <div className="w-24 h-24 bg-green-50 text-green-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-green-50 rotate-3">
          <CheckCircle2 size={48} />
        </div>
        <h2 className="text-4xl font-black tracking-tighter mb-4 uppercase italic">Protocolo <span className="text-[#FF6600]">Gerado</span></h2>
        <p className="text-slate-400 font-medium mb-10 leading-relaxed">
          A solicitação para o veículo <span className="text-slate-900 font-bold tracking-widest">{data.plate}</span> foi autenticada em nosso sistema cloud.
        </p>
        
        <div className="bg-slate-50 p-6 rounded-[2rem] mb-10 border-2 border-slate-100 text-left space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Serviço Técnico</span> 
            <span className="text-xs font-black uppercase text-slate-900">{data.serviceType}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status Inicial</span> 
            <span className="px-3 py-1 bg-orange-100 text-[#FF6600] rounded-full text-[10px] font-black uppercase">Fila de Triagem</span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-6">
          <div className="flex gap-2">
            {[0, 1, 2].map(i => (
              <motion.div 
                key={i} 
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }} 
                transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
                className="w-2 h-2 bg-[#FF6600] rounded-full"
              />
            ))}
          </div>
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Estabelecendo Conexão com WhatsApp...</p>
        </div>
      </div>
    </motion.div>
  );
}
