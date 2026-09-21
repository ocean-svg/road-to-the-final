// Road to the Final — small progressive-enhancement script

document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.getElementById('nav-toggle');
  var nav = document.getElementById('site-nav');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  var form = document.getElementById('signup-form');
  var note = document.getElementById('form-note');
  if (form && note) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      note.textContent = 'Thanks — this is a demo form, so nothing was actually sent. Wire it up to your email or a form service (see README).';
    });
  }
});
