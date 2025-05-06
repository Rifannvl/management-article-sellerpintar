import ArticleForm from "@/components/ArticleForm";

export default function EditArticlePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold p-4">Edit Artikel</h1>
      <ArticleForm isEdit />
    </div>
  );
}
