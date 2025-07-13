// Chrome Extension Service Worker for Tab of Words
// Manifest V3 Service Worker

chrome.runtime.onInstalled.addListener(() => {
  console.log('Tab of Words extension installed')
})

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.create({ url: chrome.runtime.getURL('index.html') })
})

// Handle storage and data caching for better performance
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fetchWords') {
    // Cache words data to reduce API calls
    fetch('https://jlpt-vocab-api.vercel.app/api/words/all')
      .then(response => response.json())
      .then(data => {
        chrome.storage.local.set({ wordsData: data, lastFetch: Date.now() })
        sendResponse({ success: true, data })
      })
      .catch(error => {
        console.error('Error fetching words:', error)
        sendResponse({ success: false, error: error.message })
      })
    return true // Keep message channel open for async response
  }
})

export {}