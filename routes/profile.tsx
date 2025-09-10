import { Head } from "$fresh/runtime.ts";
import Layout from "../components/layout/Layout.tsx";
import ProfileIsland from "../islands/ProfileIsland.tsx";

export default function Profile() {
  return (
    <Layout>
      <Head>
        <title>个人资料 - 云远模板</title>
        <meta name="description" content="查看和编辑个人资料信息" />
      </Head>
      <ProfileIsland />
    </Layout>
  );
}