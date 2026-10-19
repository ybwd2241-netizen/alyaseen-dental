let currentFilter = 'all';
let searchQuery = '';
let authToken = localStorage.getItem('dentalToken');
let allAppointments = []; // لتخزين الحجوزات محلياً للبحث السريع

document.addEventListener('DOMContentLoaded', function() {
  if (authToken) {
    showDashboard();
  } else {
    showLogin();
  }

  // تسجيل الدخول
  document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const loginError = document.getElementById('loginError');
    const submitBtn = this.querySelector('button');

    loginError.textContent = '';
    submitBtn.disabled = true;
    submitBtn.textContent = 'جاري التحقق...';

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const result = await response.json();

      if (response.ok && result.success) {
        authToken = result.token;
        localStorage.setItem('dentalToken', authToken);
        showDashboard();
      } else {
        loginError.textContent = '❌ ' + (result.message || 'بيانات الدخول غير صحيحة');
      }
    } catch (error) {
      loginError.textContent = '❌ خطأ في الاتصال بالسيرفر';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'دخول';
    }
  });

  // تسجيل الخروج
  document.getElementById('logoutBtn').addEventListener('click', function() {
    authToken = null;
    localStorage.removeItem('dentalToken');
    showLogin();
  });

  // أزرار الفلترة
  document.querySelectorAll('.filter-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      currentFilter = this.getAttribute('data-status');
      renderTable(); // إعادة رسم الجدول بناءً على البيانات المخزنة
    });
  });

  // شريط البحث الفوري
  document.getElementById('searchInput').addEventListener('input', function(e) {
    searchQuery = e.target.value.trim().toLowerCase();
    renderTable();
  });
});

function showLogin() {
  document.getElementById('loginSection').classList.remove('hidden');
  document.getElementById('dashboardSection').classList.add('hidden');
}

function showDashboard() {
  document.getElementById('loginSection').classList.add('hidden');
  document.getElementById('dashboardSection').classList.remove('hidden');
  loadAppointments();
}

async function loadAppointments() {
  const tbody = document.getElementById('appointmentsTableBody');
  tbody.innerHTML = '<tr><td colspan="6" class="loading">جاري تحميل الحجوزات...</td></tr>';

  try {
    const response = await fetch('/api/appointments', {
      headers: { 'Authorization': 'Bearer ' + authToken }
    });
    const result = await response.json();

    if (response.ok && result.success) {
      allAppointments = result.appointments; // حفظ البيانات للبحث والفلترة السريعة
      updateStats(); // تحديث الإحصائيات
      renderTable(); // رسم الجدول
    } else {
      tbody.innerHTML = '<tr><td colspan="6" class="loading">❌ فشل في تحميل الحجوزات</td></tr>';
    }
  } catch (error) {
    console.error('خطأ:', error);
    tbody.innerHTML = '<tr><td colspan="6" class="loading">❌ خطأ في الاتصال بالسيرفر</td></tr>';
  }
}

// دالة تحديث الإحصائيات
function updateStats() {
  const total = allAppointments.length;
  const pending = allAppointments.filter(a => a.status === 'pending').length;
  const approved = allAppointments.filter(a => a.status === 'approved').length;
  const rejected = allAppointments.filter(a => a.status === 'rejected').length;

  document.getElementById('statTotal').textContent = total;
  document.getElementById('statPending').textContent = pending;
  document.getElementById('statApproved').textContent = approved;
  document.getElementById('statRejected').textContent = rejected;
}

// دالة رسم الجدول مع دمج الفلترة والبحث
function renderTable() {
  const tbody = document.getElementById('appointmentsTableBody');
  
  // تصفية البيانات حسب الحالة والبحث معاً
  let filtered = allAppointments.filter(apt => {
    const matchStatus = currentFilter === 'all' || apt.status === currentFilter;
    const matchSearch = apt.patientName.toLowerCase().includes(searchQuery) || 
                        apt.phone.includes(searchQuery);
    return matchStatus && matchSearch;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="loading">لا توجد حجوزات مطابقة</td></tr>';
    return;
  }

  let html = '';
  filtered.forEach(function(apt) {
    let statusText = '', statusClass = '';
    if (apt.status === 'pending') { statusText = 'قيد الانتظار'; statusClass = 'status-pending'; }
    else if (apt.status === 'approved') { statusText = 'مقبول ✅'; statusClass = 'status-approved'; }
    else if (apt.status === 'rejected') { statusText = 'مرفوض ❌'; statusClass = 'status-rejected'; }

    let actions = '';
    if (apt.status === 'pending') {
      actions = `<button class="action-btn btn-approve" onclick="updateStatus('${apt._id}', 'approved')">قبول</button>
                 <button class="action-btn btn-reject" onclick="updateStatus('${apt._id}', 'rejected')">رفض</button>`;
    } else {
      actions = `<button class="action-btn btn-approve" onclick="updateStatus('${apt._id}', 'approved')" ${apt.status === 'approved' ? 'disabled style="opacity:0.5"' : ''}>قبول</button>
                 <button class="action-btn btn-reject" onclick="updateStatus('${apt._id}', 'rejected')" ${apt.status === 'rejected' ? 'disabled style="opacity:0.5"' : ''}>رفض</button>`;
    }
    actions += `<button class="action-btn btn-delete" onclick="deleteAppointment('${apt._id}')">حذف</button>`;

    html += `<tr>
      <td><strong>${apt.patientName}</strong>${apt.email ? '<br><small style="color:#666">' + apt.email + '</small>' : ''}</td>
      <td>${apt.phone}</td>
      <td>${apt.service}</td>
      <td>${apt.date}<br><small style="color:#666">${apt.time}</small></td>
      <td><span class="status-badge ${statusClass}">${statusText}</span></td>
      <td>${actions}</td>
    </tr>`;
  });

  tbody.innerHTML = html;
}

async function updateStatus(id, status) {
  if (!confirm('هل أنت متأكد من ' + (status === 'approved' ? 'قبول' : 'رفض') + ' هذا الحجز؟')) return;

  try {
    const response = await fetch('/api/appointments/' + id, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + authToken
      },
      body: JSON.stringify({ status: status })
    });
    const result = await response.json();

    if (response.ok && result.success) {
      alert('✅ تم تحديث حالة الحجز بنجاح');
      loadAppointments(); // إعادة تحميل لتحديث الإحصائيات والجدول
    } else {
      alert('❌ ' + (result.message || 'فشل في التحديث'));
    }
  } catch (error) {
    alert('❌ خطأ في الاتصال بالسيرفر');
  }
}

async function deleteAppointment(id) {
  if (!confirm('هل أنت متأكد من حذف هذا الحجز نهائياً؟')) return;

  try {
    const response = await fetch('/api/appointments/' + id, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + authToken }
    });
    const result = await response.json();

    if (response.ok && result.success) {
      alert('✅ تم حذف الحجز بنجاح');
      loadAppointments();
    } else {
      alert('❌ ' + (result.message || 'فشل في الحذف'));
    }
  } catch (error) {
    alert('❌ خطأ في الاتصال بالسيرفر');
  }
}