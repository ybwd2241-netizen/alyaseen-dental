// انتظار تحميل الصفحة بالكامل
document.addEventListener('DOMContentLoaded', function() {
  const bookingForm = document.getElementById('bookingForm');
  const formMessage = document.getElementById('formMessage');

  // التحقق من وجود النموذج
  if (!bookingForm) {
    console.error('نموذج الحجز غير موجود');
    return;
  }

  // معالجة إرسال النموذج
  bookingForm.addEventListener('submit', async function(e) {
    e.preventDefault(); // منع إعادة تحميل الصفحة

    // جمع البيانات من النموذج
    const formData = new FormData(bookingForm);
    const data = Object.fromEntries(formData.entries());

    // إخفاء أي رسالة سابقة
    formMessage.style.display = 'none';
    formMessage.className = 'form-message';

    // تعطيل زر الإرسال
    const submitBtn = bookingForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'جاري الإرسال...';

    try {
      // إرسال البيانات إلى الـ Backend
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // رسالة نجاح
        formMessage.textContent = '✅ تم إرسال الحجز بنجاح! سنتواصل معك قريباً لتأكيد الموعد.';
        formMessage.classList.add('success');
        formMessage.style.display = 'block';

        // تفريغ النموذج
        bookingForm.reset();

        // التمرير إلى رسالة النجاح
        formMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        // رسالة خطأ من السيرفر
        formMessage.textContent = '❌ ' + (result.message || 'حدث خطأ أثناء إرسال الحجز');
        formMessage.classList.add('error');
        formMessage.style.display = 'block';
      }
    } catch (error) {
      // رسالة خطأ في الاتصال
      console.error('خطأ:', error);
      formMessage.textContent = '❌ خطأ في الاتصال بالسيرفر. حاول مرة أخرى.';
      formMessage.classList.add('error');
      formMessage.style.display = 'block';
    } finally {
      // إعادة تفعيل زر الإرسال
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });

  // تمرير سلس للروابط الداخلية
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  console.log('✅ نموذج الحجز جاهز للعمل');
});