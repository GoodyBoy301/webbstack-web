import { Brand } from "./Brand";
export function DashboardHeader() { return <header className="dashboard-nav"><Brand /><div className="dashboard-nav-actions"><span className="dashboard-user">Independent developer</span><button className="avatar" aria-label="Account menu">ID</button></div></header>; }
