document.documentElement.classList.add('js');

const navigationEntry = performance.getEntriesByType('navigation')[0];
const initialScrollTarget = (() => {
  const hash = window.location.hash.slice(1);
  if (!hash) return '';

  try {
    return decodeURIComponent(hash);
  } catch {
    return hash;
  }
})();
const shouldResetScroll = !initialScrollTarget && navigationEntry?.type === 'reload';
const cleanUrl = () => `${window.location.pathname}${window.location.search}`;

if (initialScrollTarget) {
  history.replaceState(history.state, '', cleanUrl());
}

if ('scrollRestoration' in history) {
  history.scrollRestoration = shouldResetScroll ? 'manual' : 'auto';
}

document.addEventListener('DOMContentLoaded', () => {
  let storedScrollTarget = '';
  try {
    storedScrollTarget = sessionStorage.getItem('greenhill-scroll-target') || '';
    sessionStorage.removeItem('greenhill-scroll-target');
  } catch {
    storedScrollTarget = '';
  }

  const requestedScrollTarget = initialScrollTarget || storedScrollTarget;
  const restoreScrollPosition = () => {
    const targetId = requestedScrollTarget;
    if (!targetId) return;
    document.getElementById(targetId)?.scrollIntoView();
  };

  if (document.fonts?.ready) {
    document.fonts.ready.then(() => window.requestAnimationFrame(restoreScrollPosition));
  } else {
    window.requestAnimationFrame(restoreScrollPosition);
  }

  if (shouldResetScroll) {
    window.requestAnimationFrame(() => window.scrollTo(0, 0));
  }

  const menuButton = document.querySelector('[data-menu-button]');
  const navigation = document.querySelector('[data-navigation]');

  menuButton?.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!isOpen));
    navigation?.toggleAttribute('data-open', !isOpen);
  });

  navigation?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menuButton?.setAttribute('aria-expanded', 'false');
      navigation.removeAttribute('data-open');
    });
  });

  document.addEventListener('click', (event) => {
    if (
      event.defaultPrevented
      || event.button !== 0
      || event.metaKey
      || event.ctrlKey
      || event.shiftKey
      || event.altKey
    ) return;

    const clickedElement = event.target instanceof Element ? event.target : null;
    const link = clickedElement?.closest('a[href*="#"]');
    if (!(link instanceof HTMLAnchorElement) || link.target === '_blank' || link.hasAttribute('download')) return;

    const targetUrl = new URL(link.href, window.location.href);
    if (targetUrl.origin !== window.location.origin || !targetUrl.hash) return;

    let targetId = targetUrl.hash.slice(1);
    try {
      targetId = decodeURIComponent(targetId);
    } catch {
      // Keep the original fragment when it is not valid URI text.
    }
    if (!targetId) return;

    event.preventDefault();

    if (targetUrl.pathname === window.location.pathname) {
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
      history.replaceState(history.state, '', cleanUrl());
      return;
    }

    try {
      sessionStorage.setItem('greenhill-scroll-target', targetId);
    } catch {
      // Navigation still works even when session storage is unavailable.
    }
    window.location.assign(`${targetUrl.pathname}${targetUrl.search}`);
  });

  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.setAttribute('data-visible', '');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14 },
    );

    document.querySelectorAll('[data-reveal]').forEach((element) => observer.observe(element));
  } else {
    document.querySelectorAll('[data-reveal]').forEach((element) => element.setAttribute('data-visible', ''));
  }

  const contactForm = document.querySelector('[data-contact-form]');
  if (!(contactForm instanceof HTMLFormElement)) return;

  const status = contactForm.querySelector('[data-form-status]');
  const submitButton = contactForm.querySelector('button[type="submit"]');
  const endpoint = contactForm.dataset.contactEndpoint || '/api/contact';
  const locale = contactForm.dataset.locale === 'vi' ? 'vi' : 'en';

  const messages = {
    sending: locale === 'vi' ? 'Đang gửi…' : 'Sending…',
    sent: locale === 'vi'
      ? 'Đã gửi rồi. Chúng tôi sẽ trả lời qua email.'
      : 'Sent. We will reply by email.',
    wait: locale === 'vi'
      ? 'Bạn vừa gửi một tin nhắn. Hãy đợi một chút rồi thử lại.'
      : 'You just sent a message. Please wait a moment before trying again.',
    invalid: locale === 'vi'
      ? 'Có vài thông tin chưa đúng. Bạn kiểm tra lại giúp nhé.'
      : 'A few details do not look right. Please check the form.',
    notConfigured: locale === 'vi'
      ? 'Form đang được hoàn thiện. Vui lòng quay lại sau.'
      : 'The form is still being set up. Please come back later.',
    rateLimited: locale === 'vi'
      ? 'Bạn đã gửi nhiều tin nhắn liên tiếp. Hãy thử lại sau khoảng 10 phút.'
      : 'You have sent several messages in a row. Please try again in about 10 minutes.',
    failed: locale === 'vi'
      ? 'Tin nhắn chưa gửi được. Vui lòng thử lại sau.'
      : 'The message was not sent. Please try again later.',
  };

  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!contactForm.reportValidity()) return;

    const formData = new FormData(contactForm);
    if (String(formData.get('website') || '').trim()) {
      contactForm.reset();
      return;
    }

    const lastSentAt = Number(sessionStorage.getItem('greenhill-contact-sent-at') || 0);
    if (Date.now() - lastSentAt < 30_000) {
      if (status) status.textContent = messages.wait;
      return;
    }

    if (submitButton instanceof HTMLButtonElement) submitButton.disabled = true;
    if (status) status.textContent = messages.sending;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        credentials: 'omit',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: String(formData.get('name') || '').trim(),
          email: String(formData.get('email') || '').trim(),
          projectType: String(formData.get('projectType') || '').trim(),
          message: String(formData.get('message') || '').trim(),
          website: String(formData.get('website') || '').trim(),
          locale,
        }),
      });

      const result = await response.json().catch(() => ({}));
      if (response.ok && result.ok) {
        sessionStorage.setItem('greenhill-contact-sent-at', String(Date.now()));
        contactForm.reset();
        if (status) status.textContent = messages.sent;
      } else if (response.status === 429) {
        if (status) status.textContent = messages.rateLimited;
      } else if (response.status === 400) {
        if (status) status.textContent = messages.invalid;
      } else if (response.status === 503) {
        if (status) status.textContent = messages.notConfigured;
      } else if (status) {
        status.textContent = messages.failed;
      }
    } catch {
      if (status) status.textContent = messages.failed;
    } finally {
      if (submitButton instanceof HTMLButtonElement) submitButton.disabled = false;
    }
  });
});
