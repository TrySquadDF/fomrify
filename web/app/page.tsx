import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]"> 
      <section className="flex-grow flex items-center justify-center bg-gradient-to-b from-background via-primary/5 to-background dark:from-slate-900 dark:via-primary/10 dark:to-slate-900 py-20 md:py-32">
        <div className="container px-4 md:px-6 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <FileText className="mx-auto h-16 w-16 text-primary" />
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
              Создавайте формы легко и быстро
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl">
              Наш сервис позволяет без труда создавать опросы, анкеты и формы обратной связи. Собирайте данные и анализируйте результаты в удобном интерфейсе.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/form/new">
                <Button size="lg" className="w-full sm:w-auto">
                  Создать новую форму
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/profile">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Перейти к моим формам
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="py-6 border-t bg-background flex justify-center">
        <div className="container px-4 md:px-6 text-center text-sm text-muted-foreground w-full">
          © {new Date().getFullYear()} formify App. Все права защищены.
        </div>
      </footer>
    </div>
  );
}