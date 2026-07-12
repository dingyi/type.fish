import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import About from "./pages/About";
import DesignerDetail from "./pages/DesignerDetail";
import Designers from "./pages/Designers";
import FoundryDetail from "./pages/FoundryDetail";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Submit from "./pages/Submit";
import TypefaceDetail from "./pages/TypefaceDetail";
import Typefaces from "./pages/Typefaces";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<Index />} path="/" />
          <Route element={<FoundryDetail />} path="/foundries/:id" />
          <Route element={<Typefaces />} path="/typefaces" />
          <Route element={<TypefaceDetail />} path="/typefaces/:slug" />
          <Route element={<Designers />} path="/designers" />
          <Route element={<DesignerDetail />} path="/designers/:slug" />
          <Route element={<About />} path="/about" />
          <Route element={<Submit />} path="/submit" />
          <Route element={<NotFound />} path="*" />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
