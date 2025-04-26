export function createReplyQuicklyPopup({ senderIntent, suggestions }) {
    const popup = document.createElement('div');

    popup.className = `fixed z-50 right-8 bottom-24 bg-white rounded-xl shadow-2xl w-[380px] font-sans border border-gray-200`;
    popup.style.padding = '0';

    popup.innerHTML = `
    <div class="p-4 border-b border-gray-100 flex items-center">
      <img src="[https://static.grammarly.com/assets/files/5b7a1d8e6f8c4e7e8a0c.svg"](https://static.grammarly.com/assets/files/5b7a1d8e6f8c4e7e8a0c.svg") class="w-6 h-6 mr-2" />
      <span class="font-semibold text-gray-700">Reply quickly</span>
    </div>
    <div class="p-4">
      <div class="mb-3">
        <div class="text-xs text-gray-500 mb-1">Sender’s intent</div>
        <div class="bg-gray-50 rounded p-2 text-sm text-gray-700">${senderIntent}</div>
      </div>
      <div class="mb-3">
        <div class="text-xs text-gray-500 mb-1">How do you want to reply?</div>
        ${suggestions.map(s => `
          <button class="flex items-center w-full mb-2 p-2 rounded hover:bg-indigo-50 transition" data-reply="${encodeURIComponent(s.text)}">
            <span class="mr-2">${s.icon}</span>
            <span class="font-medium text-gray-700">${s.title}</span>
            <span class="ml-auto text-xs text-gray-400">${s.desc}</span>
          </button>
        `).join('')}
        <button class="text-indigo-600 text-xs mt-1 hover:underline" id="more-ideas-btn">More ideas</button>
      </div>
      <input id="custom-reply" class="w-full p-2 border rounded text-sm" placeholder="Type your own reply..." />
    </div>
    <div class="flex justify-end p-2 border-t">
      <button class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700" id="close-reply-popup">Close</button>
    </div>
  `;
    return popup;
}