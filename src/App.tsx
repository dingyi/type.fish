import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
// TEMP: tooltip replaced with Base UI in stage D
// import { TooltipProvider } from "@/components/ui/tooltip";
import About from "./pages/About";
import Designers from "./pages/Designers";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Submit from "./pages/Submit";
import Typefaces from "./pages/Typefaces";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <>
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<Index />} path="/" />
          <Route element={<Typefaces />} path="/typefaces" />
          <Route element={<Designers />} path="/designers" />
          <Route element={<About />} path="/about" />
          <Route element={<Submit />} path="/submit" />
          <Route element={<NotFound />} path="*" />
        </Routes>
      </BrowserRouter>
    </>
  </QueryClientProvider>
);

export default App;
