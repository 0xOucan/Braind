import DownloadContracts from "./_components/DownloadContracts";
import type { NextPage } from "next";
import { getMetadata } from "~~/utils/scaffold-stark/getMetadata";

export const metadata = getMetadata({
  title: "Configure Contracts",
  description: "Configure your deployed 🏗 Scaffold-Stark 2 contracts",
});

// Force dynamic rendering to avoid static generation errors
export const dynamic = 'force-dynamic';

const Configure: NextPage = () => {
  return <DownloadContracts />;
};

export default Configure;
