// Popup script for Chrome extension
document.addEventListener('DOMContentLoaded', function() {
  const openNewTabBtn = document.getElementById('openNewTab')
  const resetProgressBtn = document.getElementById('resetProgress')
  const romajiToggle = document.getElementById('romajiToggle')
  const levelCheckboxes = document.getElementById('levelCheckboxes')
  const status = document.getElementById('status')

  // Load current settings
  chrome.storage.local.get(['tab-of-words-settings'], function(result) {
    const settings = result['tab-of-words-settings'] || {
      version: '0.0.1',
      mode: 'ichigoichie',
      romaji: false,
      levels: [
        { level: 1, enabled: true },
        { level: 2, enabled: true },
        { level: 3, enabled: true },
        { level: 4, enabled: true },
        { level: 5, enabled: true }
      ],
      theme: 'light'
    }
    
    romajiToggle.checked = settings.romaji
    
    // Create level checkboxes
    const levels = settings.levels || [
      { level: 1, enabled: true },
      { level: 2, enabled: true },
      { level: 3, enabled: true },
      { level: 4, enabled: true },
      { level: 5, enabled: true }
    ]
    
    levels.forEach(levelObj => {
      const div = document.createElement('div')
      div.className = 'checkbox-item'
      
      const checkbox = document.createElement('input')
      checkbox.type = 'checkbox'
      checkbox.id = `level${levelObj.level}`
      checkbox.checked = levelObj.enabled
      
      const label = document.createElement('label')
      label.htmlFor = `level${levelObj.level}`
      label.textContent = `JLPT N${levelObj.level}`
      
      div.appendChild(checkbox)
      div.appendChild(label)
      levelCheckboxes.appendChild(div)
      
      // Add event listener for level changes
      checkbox.addEventListener('change', function() {
        updateLevelSetting(levelObj.level, checkbox.checked)
      })
    })
  })

  // Event listeners
  openNewTabBtn.addEventListener('click', function() {
    chrome.tabs.create({ url: chrome.runtime.getURL('index.html') })
    window.close()
  })

  resetProgressBtn.addEventListener('click', function() {
    if (confirm('Are you sure you want to reset all progress?')) {
      chrome.storage.local.remove(['learned', 'met'], function() {
        status.textContent = 'Progress reset successfully'
        setTimeout(() => {
          status.textContent = 'Extension ready'
        }, 2000)
      })
    }
  })

  romajiToggle.addEventListener('change', function() {
    chrome.storage.local.get(['tab-of-words-settings'], function(result) {
      const settings = result['tab-of-words-settings'] || {
        version: '0.0.1',
        mode: 'ichigoichie',
        romaji: false,
        levels: [1, 2, 3, 4, 5].map(level => ({ level, enabled: true })),
        theme: 'light'
      }
      settings.romaji = romajiToggle.checked
      chrome.storage.local.set({ 'tab-of-words-settings': settings }, function() {
        status.textContent = 'Settings saved'
        setTimeout(() => {
          status.textContent = 'Extension ready'
        }, 1000)
      })
    })
  })

  function updateLevelSetting(level, enabled) {
    chrome.storage.local.get(['tab-of-words-settings'], function(result) {
      const settings = result['tab-of-words-settings'] || {
        version: '0.0.1',
        mode: 'ichigoichie',
        romaji: false,
        levels: [1, 2, 3, 4, 5].map(l => ({ level: l, enabled: true })),
        theme: 'light'
      }
      if (!settings.levels) {
        settings.levels = [
          { level: 1, enabled: true },
          { level: 2, enabled: true },
          { level: 3, enabled: true },
          { level: 4, enabled: true },
          { level: 5, enabled: true }
        ]
      }
      
      const levelIndex = settings.levels.findIndex(l => l.level === level)
      if (levelIndex !== -1) {
        settings.levels[levelIndex].enabled = enabled
      }
      
      chrome.storage.local.set({ 'tab-of-words-settings': settings }, function() {
        status.textContent = 'Level settings updated'
        setTimeout(() => {
          status.textContent = 'Extension ready'
        }, 1000)
      })
    })
  }
})