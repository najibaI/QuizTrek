const toggleButton = document.getElementById('toggle-btn')
const sidebar = document.getElementById('sidebar')

// -- General Sidebar toggling --
function toggleSidebar(){
  sidebar.classList.toggle('close')
  toggleButton.classList.toggle('rotate')

  closeAllSubMenus()
}

// -- General Sub-menu toggling --
function toggleSubMenu(button){

  // if the button isn't triggered to the show toggle (arrow pointing to the left), it closes the sidebar
  if(!button.nextElementSibling.classList.contains('show')){
    closeAllSubMenus()
  }

  button.nextElementSibling.classList.toggle('show')
  button.classList.toggle('rotate')

  if(sidebar.classList.contains('close')){
    sidebar.classList.toggle('close')
    toggleButton.classList.toggle('rotate')
  }
}

// -- 'Sign Out' Button trigger --
function toggleLogoutButton(button) {
  if (confirm("Are you sure you want to log out?")) {
      window.location.href = "/logout"; // this will call the Flask route that clears session
  }
}

function closeAllSubMenus(){
  Array.from(sidebar.getElementsByClassName('show')).forEach(ul => {
    ul.classList.remove('show')
    ul.previousElementSibling.classList.remove('rotate')
  })
}
