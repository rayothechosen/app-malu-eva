import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

const LiveShopDemo = lazy(() => import("./pages/LiveShopDemo"));
const Eva = lazy(() => import("./pages/Eva"));
const Malu = lazy(() => import("./pages/Malu"));

function RouteLoader() {
  return <div className="min-h-screen bg-[#F4EFE6] flex items-center justify-center text-sm font-semibold text-black/45">Carregando...</div>;
}

const App = () => (
  <BrowserRouter>
    <Suspense fallback={<RouteLoader />}>
      <Routes>
        <Route path="/" element={<Navigate to="/liveshop" replace />} />

        <Route path="/liveshop" element={<LiveShopDemo />} />

        <Route path="/eva/v1/*" element={<Eva versao="v1" />} />
        <Route path="/eva/v2/*" element={<Eva versao="v2" />} />
        <Route path="/eva/*" element={<Eva />} />

        <Route path="/malu/*" element={<Malu />} />

        {/* Rotas antigas do Destrava — redirecionam para a Eva */}
        <Route path="/destrava-tiktok-shop" element={<Navigate to="/eva/postar" replace />} />
        <Route path="/destrava-tiktok-shop/v1" element={<Navigate to="/eva/v1/postar" replace />} />
        <Route path="/destrava-tiktok-shop/v2" element={<Navigate to="/eva/v2/postar" replace />} />
        <Route path="*" element={<Navigate to="/liveshop" replace />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
);

export default App;
