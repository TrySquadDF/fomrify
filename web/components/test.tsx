'use client'
import { useAuthContext } from "@/src/processes/auth/model/authContext";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

const check = async () => {
    return fetch('https://localhost:8080/auth/check', {
      method: 'GET',
      credentials: 'include', // Добавляем для передачи куков
    }).then((res) => res.json());
}

export const Test = () => {
    // Инициализируем state как объект или null
    const [data, setData] = useState(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      check()
        .then(response => setData(response))
        .catch(err => {
          console.error(err);
          setError('Ошибка при проверке авторизации');
        });
    }, []);

    if (error) return <div>{error}</div>;
    if (!data) return <div>Загрузка...</div>;

    // Преобразуем объект в строку для отображения
    return (
      <div>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
    );
}

export const TestProvider = () => {
    const data = useAuthContext()
    const router = useRouter()

    return <div>{
        JSON.stringify(data)
      }
      </div>
}