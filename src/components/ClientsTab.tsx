/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { LocalDatabaseService } from "../services/localDb";
import { Client } from "../types";
import { Plus, Users, User, Building, Phone, Mail, FileKey, Trash2, Search } from "lucide-react";

interface ClientsTabProps {
  onToast: (msg: string, type: "success" | "error") => void;
}

export default function ClientsTab({ onToast }: ClientsTabProps) {
  const [clients, setClients] = useState<Client[]>(() => LocalDatabaseService.getClients());
  const [search, setSearch] = useState<string>("");

  // Input states for new client
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [fullName, setFullName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [identityNumber, setIdentityNumber] = useState<string>("");
  const [clientType, setClientType] = useState<"INDIVIDUAL" | "ORGANIZATION">("INDIVIDUAL");

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      onToast("الرجاء إدخال اسم العميل ورقم الهاتف على الأقل", "error");
      return;
    }

    const newClient: Client = {
      clientId: "cl-" + Date.now(),
      fullName,
      phone,
      email: email || "لا يوجد بريد إلكتروني",
      identityNumber,
      type: clientType,
      createdAt: new Date().toISOString()
    };

    LocalDatabaseService.addClient(newClient);
    setClients(LocalDatabaseService.getClients());
    onToast("تم إضافة العميل بنجاح إلى قاعدة البيانات", "success");

    // Clear Form
    setFullName("");
    setPhone("");
    setEmail("");
    setIdentityNumber("");
    setShowAddForm(false);
  };

  const handleDeleteClient = (id: string) => {
    if (confirm("هل أنت متأكد من رغبتك في حذف هذا العميل من النظام؟")) {
      const filtered = clients.filter(c => c.clientId !== id);
      LocalDatabaseService.saveClients(filtered);
      setClients(filtered);
      onToast("تم حذف العميل بنجاح", "success");
    }
  };

  const filteredClients = clients.filter(c => 
    c.fullName.toLowerCase().includes(search.toLowerCase()) || 
    c.phone.includes(search)
  );

  return (
    <div className="space-y-6 animate-fade-in" id="clients-tab">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-3xs">
        <div>
          <h2 className="text-lg font-bold text-[#1a3636] flex items-center gap-2">
            <Users className="w-5 h-5 text-[#c2b280]" />
            سجل الموكلين والعملاء
          </h2>
          <p className="text-xs text-gray-500 font-medium">إدارة وتعديل بيانات الأفراد والشركات في المكتب القانوني.</p>
        </div>
        
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-[#1a3636] hover:bg-[#2c4c4c] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4 text-[#c2b280]" />
          إضافة موكل جديد
        </button>
      </div>

      {/* Add Client Form */}
      {showAddForm && (
        <form onSubmit={handleAddClient} className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-[#1a3636] border-b border-gray-50 pb-2">تفاصيل العميل الجديد</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">الاسم الكامل للموكل *</label>
              <input 
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="مثال: الشيخ فؤاد محمد الكبسي"
                className="w-full text-xs px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1a3636]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">رقم الهاتف الجوال *</label>
              <input 
                type="text" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="مثال: 777123456"
                className="w-full text-xs px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1a3636]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">البريد الإلكتروني</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="مثال: custom@mizan.com"
                className="w-full text-xs px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1a3636]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">الرقم الوطني / السجل التجاري</label>
              <input 
                type="text" 
                value={identityNumber}
                onChange={(e) => setIdentityNumber(e.target.value)}
                placeholder="مثال: 01010045231"
                className="w-full text-xs px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1a3636]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">تصنيف العميل</label>
              <select 
                value={clientType}
                onChange={(e) => setClientType(e.target.value as any)}
                className="w-full text-xs px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1a3636] cursor-pointer"
              >
                <option value="INDIVIDUAL">فرد (مواطن / مقيم)</option>
                <option value="ORGANIZATION">منشأة / شركة تجارية</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 justify-end border-t border-gray-100 pt-3">
            <button 
              type="button" 
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-gray-200 hover:bg-slate-50 text-xs font-bold rounded-xl transition-all"
            >
              إلغاء
            </button>
            <button 
              type="submit" 
              className="px-5 py-2 bg-[#1a3636] hover:bg-[#2c4c4c] text-white text-xs font-bold rounded-xl transition-all"
            >
              حفظ العميل
            </button>
          </div>
        </form>
      )}

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-3xs flex gap-2 items-center">
        <Search className="w-4 h-4 text-gray-400" />
        <input 
          type="text" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث باسم الموكل أو رقم الهاتف للفلترة المباشرة..."
          className="flex-1 text-xs bg-transparent focus:outline-none"
        />
      </div>

      {/* Clients List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-2xl border border-gray-100 text-center text-gray-400">
            <Users className="w-12 h-12 mx-auto text-slate-200 mb-2" />
            <p className="text-xs font-bold">لا يوجد موكلين مطابقين لمعيار البحث</p>
          </div>
        ) : (
          filteredClients.map((client) => (
            <div key={client.clientId} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-3xs hover:border-gray-200 transition-all space-y-4 relative group">
              <button 
                onClick={() => handleDeleteClient(client.clientId)}
                className="absolute top-4 left-4 p-1.5 bg-red-50 text-red-600 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-100 transition-all"
                title="حذف العميل"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${client.type === 'ORGANIZATION' ? 'bg-amber-50 text-amber-700' : 'bg-[#1a3636]/5 text-[#1a3636]'}`}>
                  {client.type === 'ORGANIZATION' ? <Building className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-gray-800 leading-tight">{client.fullName}</h4>
                  <span className="text-[9px] font-bold text-gray-400 block mt-1">
                    {client.type === 'ORGANIZATION' ? 'شركة / منشأة' : 'مواطن / فرد'}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-50 pt-3 space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                  <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="font-mono">{client.phone}</span>
                </div>

                <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                  <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="truncate">{client.email}</span>
                </div>

                {client.identityNumber && (
                  <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                    <FileKey className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="font-mono">{client.identityNumber}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
