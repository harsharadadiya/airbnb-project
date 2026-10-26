// Material UI theme, matched to the same colors and font as our Tailwind / shadcn design tokens.
import { createTheme } from '@mui/material/styles';

export const muiTheme = createTheme({
  palette: {
    primary: { main: '#e5484d', contrastText: '#ffffff' },
    secondary: { main: '#222222' },
    text: { primary: '#2a2321', secondary: '#77706b' },
    background: { default: '#fdfcfb', paper: '#ffffff' },
    divider: '#ebe7e3',
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiTab: { styleOverrides: { root: { fontWeight: 600, minHeight: 48 } } },
    MuiSkeleton: { defaultProps: { animation: 'wave' } },
    MuiRating: { styleOverrides: { iconFilled: { color: '#222222' } } },
    MuiSlider: { styleOverrides: { thumb: { width: 22, height: 22, backgroundColor: '#fff', border: '1px solid #ccc' } } },
  },
});
