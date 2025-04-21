```graphql
mutation CreateTestForm {
  createForm(
    input: {
      title: "Опрос о качестве обслуживания"
      description: "Помогите нам стать лучше, пройдя короткий опрос"
      access: PUBLIC
      questions: [
        {
          text: "Как вас зовут?"
          type: SHORT_TEXT
          required: true
          order: 1
        },
        {
          text: "Ваш email для связи"
          type: EMAIL
          required: true
          order: 2
        },
        {
          text: "Ваш номер телефона"
          type: PHONE
          required: false
          order: 3
        },
        {
          text: "Когда вы посетили наше заведение?"
          type: DATE
          required: true
          order: 4
        },
        {
          text: "Как вы оцениваете наше обслуживание?"
          type: SINGLE_CHOICE
          required: true
          order: 5
          options: [
            { text: "Отлично", order: 1 },
            { text: "Хорошо", order: 2 },
            { text: "Удовлетворительно", order: 3 },
            { text: "Плохо", order: 4 },
            { text: "Очень плохо", order: 5 }
          ]
        },
        {
          text: "Что вам больше всего понравилось?"
          type: MULTIPLE_CHOICE
          required: false
          order: 6
          options: [
            { text: "Интерьер", order: 1 },
            { text: "Персонал", order: 2 },
            { text: "Меню", order: 3 },
            { text: "Скорость обслуживания", order: 4 },
            { text: "Цены", order: 5 }
          ]
        },
        {
          text: "Порекомендуете ли вы нас друзьям?"
          type: BOOLEAN
          required: true
          order: 7
        },
        {
          text: "Оцените качество блюд по шкале от 1 до 10"
          type: NUMBER
          required: true
          order: 8
        },
        {
          text: "Поделитесь своими впечатлениями и пожеланиями"
          type: PARAGRAPH
          required: false
          order: 9
        }
      ]
    }
  ) {
    id
    title
    description
    access
    createdAt
    updatedAt
    questions {
      id
      text
      type
      required
      order
      options {
        id
        text
        order
      }
    }
  }
}
```