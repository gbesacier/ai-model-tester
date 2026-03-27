// Reusable style constants for all forms and pages

// Labels
export const styles = {
  // Labels
  label: {
    base: 'block text-sm font-semibold text-gray-700',
    small: 'block text-xs font-semibold text-gray-700',
    smallMuted: 'block text-xs font-semibold text-gray-600',
  },

  // Form Inputs & Textareas
  input: {
    base: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
    sm: 'px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500',
    textarea: 'w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono',
    search: 'w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500',
    auth: 'mt-1 block w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500',
  },

  // Buttons
  button: {
    primary: 'bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
    primarySmall: 'flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors',
    secondary: 'px-3 py-2 rounded text-sm font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700',
    secondaryInactive: 'px-3 py-2 rounded text-sm font-medium transition-colors bg-gray-200 text-gray-700 hover:bg-gray-300',
    filter: 'px-3 py-1 rounded text-xs font-medium transition-colors bg-blue-600 text-white',
    filterInactive: 'px-3 py-1 rounded text-xs font-medium transition-colors bg-gray-200 text-gray-700 hover:bg-gray-300',
    delete: 'p-1 text-red-600 hover:bg-red-50 rounded transition-colors',
    dropdown: 'w-full px-4 py-2 text-left border border-gray-300 rounded-lg bg-white flex items-center justify-between hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500',
    auth: 'w-full rounded bg-blue-600 text-white py-2 font-semibold hover:bg-blue-700 disabled:bg-blue-300 transition-colors',
  },

  // Containers & Cards
  container: {
    sectionBase: 'space-y-2',
    section: 'space-y-3',
    messageCard: 'p-4 border border-gray-200 rounded-lg space-y-3',
    infoCard: 'px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 space-y-2',
    dropdown: 'bg-white border border-gray-300 rounded-lg shadow-lg z-10',
    authCard: 'max-w-md w-full bg-white p-8 rounded-xl shadow',
    authPage: 'min-h-screen flex items-center justify-center bg-zinc-100 py-12 px-4',
  },

  // Text Styles
  text: {
    base: 'text-gray-900',
    muted: 'text-gray-500',
    mutedSmall: 'text-xs text-gray-500',
    mutedSmallMt: 'text-xs text-gray-600 mt-1',
    error: 'text-red-700',
    italic: 'text-gray-500 text-sm italic',
    authHeading: 'text-2xl font-semibold mb-6',
    authError: 'text-sm text-red-600 mb-4',
  },

  // Error Messages
  error: 'p-4 bg-red-50 text-red-700 rounded-lg',

  // Grid & Layout
  layout: {
    form: 'space-y-8',
    authForm: 'space-y-4',
    parameterGrid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
    flex: 'flex items-center justify-between',
    flexEnd: 'flex justify-end',
    flexGap: 'flex items-end gap-2',
  },

  // Loading/Empty States
  loadingContainer: 'flex items-center justify-center p-8',
};
