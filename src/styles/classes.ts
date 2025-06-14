// Reusable style classes
export const styleClasses = {
  // Typography
  displayXl: 'text-4xl font-bold tracking-tight',
  displayLg: 'text-2xl font-semibold tracking-tight', 
  displayMd: 'text-xl font-semibold',
  bodyLg: 'text-base leading-relaxed',
  body: 'text-sm leading-relaxed',

  // Focus states
  focusRing: 'focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:ring-offset-2 focus:ring-offset-slate-900',

  // Animations
  pulseGentle: 'animate-pulse',
  bounceGentle: 'animate-bounce',

  // Backgrounds
  cardGradient: 'bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm',
  modalBackdrop: 'bg-black/60 backdrop-blur-sm',
  modalContainer: 'bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl shadow-black/50',

  // Buttons
  buttonPrimary: 'bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-900 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 font-medium transition-all duration-200',
  buttonSecondary: 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-100 border border-slate-600/50 hover:border-slate-500/50 backdrop-blur-sm transition-all duration-200',
  buttonGhost: 'hover:bg-slate-800/50 text-slate-300 hover:text-slate-100 transition-all duration-200',

  // Inputs
  input: 'bg-slate-800/50 border border-slate-600/50 rounded-xl text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/20 transition-all duration-200',

  // Cards
  card: 'bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl shadow-xl shadow-black/20 transition-all duration-300 border border-slate-700/30',
  cardHover: 'hover:shadow-2xl hover:shadow-black/30 hover:scale-[1.02] hover:border-slate-600/50 cursor-pointer transition-all duration-300 ease-out',
};