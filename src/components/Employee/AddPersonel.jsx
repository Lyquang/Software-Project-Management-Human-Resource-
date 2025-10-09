import React, { useState, useRef, useEffect, Children } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';

export const AddPersonel = ({children}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    position: 'EMPLOYEE',
    gender: 'MALE',
    email: '',
    city: '',
    street: '',
    phone: ''
  });

  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setShowDropdown(prev => !prev);
  };

  const handleAddEmployee = () => {
    setFormData(prev => ({ ...prev, position: 'EMPLOYEE' }));
    setShowDropdown(false);
    setShowForm(true);
  };

  const handleAddManager = () => {
    setFormData(prev => ({ ...prev, position: 'MANAGER' }));
    setShowDropdown(false);
    setShowForm(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 1. Create account
      const accountRes = await axios.post('http://localhost:8080/api/account/create', {
        username: formData.username,
        password: formData.password
      });

      if (accountRes.data.code === 1000 && formData.position === 'EMPLOYEE') {
        const accountId = accountRes.data.result.id;

        // 2. Send personal info (replace URL if different)
        const personRes = await axios.post('http://localhost:8080/api/employee/create', {
          accountId,
          firstName: formData.firstName,
          lastName: formData.lastName,
          position: formData.position,
          gender: formData.gender,
          email: formData.email,
          city: formData.city,
          street: formData.street,
          phone: formData.phone
        });

        alert('✅ Tạo tài khoản EMPLOYEE thành công!');
        setShowForm(false);
        setFormData({
          username: '',
          password: '',
          firstName: '',
          lastName: '',
          position: 'EMPLOYEE',
          gender: '',
          email: '',
          city: '',
          street: '',
          phone: ''
        });
      }  
      else if(accountRes.data.code === 1000 && formData.position === 'MANAGER') {
        const accountId = accountRes.data.result.id;

        // 2. Send personal info (replace URL if different)
        const personRes = await axios.post('http://localhost:8080/api/managers/create', {
          accountId,
          firstName: formData.firstName,
          lastName: formData.lastName,
          position: formData.position,
          gender: formData.gender,
          email: formData.email,
          city: formData.city,
          street: formData.street,
          phone: formData.phone
        });

        alert('✅ Tạo tài khoản MANAGER thành công!');
        setShowForm(false);
        setFormData({
          username: '',
          password: '',
          firstName: '',
          lastName: '',
          position: 'MANAGER',
          gender: '',
          email: '',
          city: '',
          street: '',
          phone: ''
        });

      }
     else {
        alert('❌ Lỗi tạo tài khoản: ' + accountRes.data.message);
      }
    } catch (error) {
      console.error(error);
      alert('❌ Có lỗi xảy ra khi tạo tài khoản hoặc nhân sự.');
    }
  };

  // Click ngoài để đóng dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="container mt-4">
      <div className="dropdown mb-3 " style={{backgroundColor:'transparent'}} ref={dropdownRef}>
        <span className="btn btn-success dropdown-toggle" type="button" onClick={toggleDropdown}>
          {children ||"+ Thêm nhân sự"}
        </span>

        <div className={`dropdown-menu ${showDropdown ? 'show' : ''}` }>
          <button className="dropdown-item bg-success " onClick={handleAddEmployee}>
            ➕ Add Employee
          </button>
          <button className="dropdown-item bg-success " onClick={handleAddManager}>
            ➕ Add Manager
          </button>
        </div>
      </div>

      {showForm && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1050
        }}
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Thông tin tài khoản & nhân sự</h5>
              <button
                type="button"
                className="close"
                onClick={() => setShowForm(false)}
              >
                <span>&times;</span>
              </button>
            </div>

            <div className="modal-body" style={{ maxHeight: '75rem',maxWidth: '60rem', overflowY: 'auto' }}>
              <form onSubmit={handleSubmit}>
                <form style={{ gap: '3rem' }}>
                    <div class="row">
                        <div class="col">
                            <input type="text" class="form-control" id="email" placeholder="Enter username" name="username" value={formData.username} onChange={handleChange} required />
                        </div>
                        <div class="col">
                            <input type="password" class="form-control" placeholder="Enter password" name="password" value={formData.password} onChange={handleChange} required/>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col">
                            <input type="text" class="form-control" id="email" placeholder="LastName" name="lastName"value={formData.lastName} onChange={handleChange} required />
                        </div>
                        <div class="col">
                            <input type="text" class="form-control" placeholder="FirstName" name="firstName" value={formData.firstName} onChange={handleChange} required />
                        </div>
                    </div>

                    <div class="row">
                        <div class="col">
                            <select className="form-control" name="gender" placeholder="Gender" value={formData.gender} onChange={handleChange}> 
                                <option value="MALE">Nam</option>
                                <option value="FEMALE">Nữ</option>
                            </select>
                        </div>
                        <div class="col">
                            <input type="text" class="form-control" placeholder="Position" name="position" value={formData.position} readOnly />
                        </div>
                    </div>

                    <div class="row">
                        <div class="col">
                             <input type="email" className="form-control" placeholder="Email" name="email" value={formData.email} onChange={handleChange} required />
                        </div>
                    </div>

                    <div class="row">
                        <div class="col">
                            <input type="text" class="form-control" id="email" placeholder="City" name="city"  value={formData.city} onChange={handleChange} required />
                        </div>
                        <div class="col">
                            <input type="text" class="form-control" placeholder="Street" name="street"value={formData.street} onChange={handleChange} required />
                        </div>
                    </div>

                     <div class="row">
                        <div class="col">
                             <input type="text" className="form-control" placeholder="PhoneNumber" name="phone" value={formData.phone} onChange={handleChange} required />
                        </div>
                    </div>

                </form>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Hủy</button>
                  <button type="submit" className="btn btn-primary">Tạo tài khoản</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
        
      )}
    </div>
  );
};
