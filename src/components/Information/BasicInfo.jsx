// src/components/Information/BasicInfo.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FaInfoCircle, FaCamera, FaUser, FaRegCalendarAlt, FaBriefcase, FaEnvelope, FaPhone } from 'react-icons/fa';
import InputField from './InputField';
import { API_ROUTES } from '../../api/apiRoutes';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const BasicInfo = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    position: '',
    email: '',
    phoneNumber: '',
    country: 'VietNam',
    city: '',
    province: '',
    address: '',
    avatarUrl: '',
    description: '',
    skills: '',
    privileges: [],
  });
  const fileInputRef = useRef(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    const fetchMyInfo = async () => {
      try {
        const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
        const res = await fetch(API_ROUTES.PERSONNELS.MY_INFO, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        const data = await res.json();
        if (res.ok && data?.code === 200 && data?.result) {
          const r = data.result;
          setFormData(prev => ({
            ...prev,
            firstName: r.firstName || '',
            lastName: r.lastName || '',
            dob: r.dob || '',
            position: r.position || '',
            email: r.email || '',
            phoneNumber: r.phoneNumber || '',
            city: r.city || '',
            address: r.street || '',
            avatarUrl: r.avatarUrl || '',
            description: r.description || '',
            skills: r.skills || '',
            privileges: Array.isArray(r.privileges) ? r.privileges : [],
          }));
          console.log('my department:', r.departmentName);


        } else {
          console.error('Fetch myInfo failed:', data);
          toast.error(data?.message || 'Fetch myInfo failed');
        }
      } catch (err) {
        console.error('Fetch myInfo error:', err);
        toast.error('Fetch myInfo error');
      }
    };

    fetchMyInfo();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let empCode = '';
    try {
      const userRaw = localStorage.getItem('user');
      if (userRaw) {
        const user = JSON.parse(userRaw);
        empCode = user?.code || user?.result?.code || '';
      }
    } catch (err) {
      console.error('Parse localStorage.user error:', err);
    }
    if (!empCode) {
      toast.error('Missing employee code. Please login again.');
      return;
    }

    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    const payload = {
      firstName: formData.firstName || '',
      lastName: formData.lastName || '',
      email: formData.email || '',
      phoneNumber: formData.phoneNumber || '',
      dob: formData.dob || '',
      city: formData.city || '',
      street: formData.address || '',
      description: formData.description || '',
      skills: formData.skills || '',
      privileges: Array.isArray(formData.privileges) ? formData.privileges : [],
    };

    try {
      const res = await fetch(API_ROUTES.PERSONNELS.UPDATE(empCode), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success('Profile updated!');
        if (data?.result) {
          const r = data.result;
          setFormData(prev => ({
            ...prev,
            firstName: r.firstName ?? prev.firstName,
            lastName: r.lastName ?? prev.lastName,
            dob: r.dob ?? prev.dob,
            position: r.position ?? prev.position,
            email: r.email ?? prev.email,
            phoneNumber: r.phoneNumber ?? prev.phoneNumber,
            city: r.city ?? prev.city,
            address: r.street ?? prev.address,
            avatarUrl: r.avatarUrl ?? prev.avatarUrl,
            description: r.description ?? prev.description,
            skills: r.skills ?? prev.skills,
            privileges: Array.isArray(r.privileges) ? r.privileges : prev.privileges,
          }));
        }
      } else {
        console.error('Update failed:', data);
        toast.error(data?.message || `Update failed (${res.status})`);
      }
    } catch (err) {
      console.error('Update error:', err);
      toast.error('Update error');
    }
  };

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setUploadingAvatar(true);
    const toastId = toast.loading('Uploading avatar...');
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');

      const form = new FormData();
      form.append('file', file); // field 'file' theo yêu cầu API

      const res = await fetch(API_ROUTES.PERSONNELS.UPLOAD_AVATAR, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          // KHÔNG đặt Content-Type để trình duyệt tự thêm boundary cho multipart/form-data
        },
        body: form,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.code !== 200) {
        throw new Error(data?.message || `Upload failed (${res.status})`);
      }

      const r = data.result;
      const newUrl = typeof r === 'string' ? r : r?.avatarUrl || r?.url || '';
      if (!newUrl) throw new Error('Missing avatarUrl in response');

      setFormData(prev => ({ ...prev, avatarUrl: newUrl }));
      toast.update(toastId, { render: 'Avatar updated!', type: 'success', isLoading: false, autoClose: 2000 });
    } catch (err) {
      toast.update(toastId, { render: err.message || 'Upload error', type: 'error', isLoading: false, autoClose: 3000 });
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const commonFieldClasses = "w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors";

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 w-full">
      <div className="flex items-center gap-2 mb-6">
        <h2 className="text-xl font-bold text-gray-800">Profile Information</h2>
        <FaInfoCircle className="text-gray-400" />
      </div>

      <form onSubmit={handleSubmit}>
        {/* Photo Profile */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Photo Profile</label>
          <div className="relative w-24 h-24">
            <img
              src={formData.avatarUrl || '/assets/qhh.jpg'}
              alt={`${formData.firstName || 'User'} Avatar`}
              className="w-full h-full rounded-full object-cover"
              onError={(e) => { e.currentTarget.src = '/assets/qhh.jpg'; }}
            />
            <button
              type="button"
              onClick={handleAvatarClick}
              disabled={uploadingAvatar}
              className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow-md border border-gray-200 hover:bg-gray-100 disabled:opacity-60"
            >
              <FaCamera className="text-gray-600" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          {/* Hàng 1: First Name & Last Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <InputField 
              label="First Name" id="firstName" name="firstName" value={formData.firstName}
              onChange={handleInputChange} placeholder="Enter first name" icon={<FaUser />}
            />
            <InputField 
              label="Last Name" id="lastName" name="lastName" value={formData.lastName}
              onChange={handleInputChange} placeholder="Enter last name" icon={<FaUser />}
            />
          </div>

          {/* Hàng 2: Date of Birth & Position */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <InputField 
              label="Date of Birth" id="dob" name="dob" type="date" value={formData.dob}
              onChange={handleInputChange} icon={<FaRegCalendarAlt />}
            />
            <InputField 
              label="Position" id="position" name="position" value={formData.position}
              onChange={handleInputChange} placeholder="Your job position" icon={<FaBriefcase />}
            />
          </div>
          
          {/* Hàng 3: Email */}
          <InputField 
            label="Email" id="email" name="email" type="email" value={formData.email}
            onChange={handleInputChange} placeholder="example@email.com" icon={<FaEnvelope />}
          />

          {/* Hàng 3.1: Phone Number */}
          <InputField
            label="Phone Number" id="phoneNumber" name="phoneNumber" value={formData.phoneNumber}
            onChange={handleInputChange} placeholder="Enter phone number" icon={<FaPhone />}
          />
          
          {/* Hàng 4: Country, City, Province */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6">
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1.5">Country</label>
              <select id="country" name="country" value={formData.country} onChange={handleInputChange} className={commonFieldClasses}>
                <option>VietNam</option>
                <option>United States</option>
              </select>
            </div>
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
              <select id="city" name="city" value={formData.city} onChange={handleInputChange} className={commonFieldClasses}>
                <option>Ho Chi Minh</option>
                <option>Ha Noi</option>
                <option>Da Nang</option>
                <option>{formData.city}</option>
              </select>
            </div>
            <div>
              <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-1.5">Province</label>
              <select id="province" name="province" value={formData.province} onChange={handleInputChange} className={commonFieldClasses}>
                <option>Vung Tau</option>
                <option>Binh Duong</option>
              </select>
            </div>
          </div>

          {/* Hàng 5: Full Address */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1.5">Full Address</label>
            <textarea 
              id="address" name="address" value={formData.address} onChange={handleInputChange} 
              rows="3" className={commonFieldClasses}
              placeholder="Enter your street name, building, house number, etc."
            ></textarea>
          </div>
        </div>

        <div className="mt-8 text-right">
          <button type="submit" className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
            Save
          </button>
        </div>
      </form>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </div>
  );
};

export default BasicInfo;