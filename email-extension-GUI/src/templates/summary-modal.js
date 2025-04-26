export function getSummaryModelHtml({ subject, summary }) {
  return `<div
    id="summary-modal-template"
    class="p-6 bg-white rounded-xl shadow-2xl min-w-[320px] max-w-[500px] font-sans"
  >
    <h2 class="text-xl font-semibold mb-3 text-indigo-700 flex items-center">
      Email Summary
    </h2>
    <div class="mb-2 text-sm text-gray-700">
      <strong>Subject:</strong> ${subject}
    </div>
    <div
      class="bg-gray-100 rounded-md p-3 text-gray-800 mb-4"
      style="white-space: pre-line"
      id="summary-content"
    >${summary}</div>
    <div class="flex justify-end">
      <button
        class="bg-indigo-600 text-white rounded px-4 py-2 font-medium hover:bg-indigo-800"
        id="close-summary-modal"
      >
        Close
      </button>
    </div>
  </div>`
}
