// Auth layout — passthrough. Root layout already provides ThemeProvider.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
