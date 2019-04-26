## Требования
    * [NodeJS](https://nodejs.org/uk/) >= 8.10

## Установка

```sh
$ git clone https://github.com/bcherepakha/fe1903__todoApp.git app
$ cd app
$ npm i
```

## Базовые правила оформления кода

![editorconfig](http://editorconfig.org/logo.png)

Все редакторы должны быть настроены одинаково. Для этого служит [editorsconfig](http://editorconfig.org/)

Общие настройки редактора приписаны в файле __.editorconfig__ .

```ini
# Для всех файлов
[*]

# Установить кодировку utf-8
charset = utf-8

# В качестве переноса строки использовать символ LF (line feed)
end_of_line = lf

# В конце файла добавить пустую строку
insert_final_newline = true

# В качестве отступов использовать 2 пробела
indent_size = 2
indent_style = space

# В конце каждой строки удалять лишние пробелы
trim_trailing_whitespace = true
```

## CodeStyle

Большая часть кода будет проверятся автоматически, соответствующими линтерами.
На те моменты, что не может пока проверить линтер будут обращать внимание преподаватели.

## Оформление HTML кода

Для проверки html-кода на валидность используем [htmllint](https://github.com/htmllint/htmllint)
Список правил можно найти [тут](https://github.com/htmllint/htmllint/wiki/Options)
Настройки линтера приписаны в файле __.htmllintrc__ .

## Оформление CSS кода

Для проверки css-кода на валидность используем [stylelint](https://stylelint.io/)
Список правил можно найти [тут](http://stylelint.io/user-guide/rules/)
Настройки линтера приписаны в файле __.stylelintrc.json__ .

## Оформление JavaScript кода

Для проверки js-кода на валидность используем [eslint](https://eslint.org/docs/rules/)
Список правил можно найти [тут](http://eslint.org/docs/rules)
Настройки линтера приписаны в файле __.eslintrc.json__ .

## Локальный сервер

Сами файлы должны лежать в папке public. Именно, в этой папке будет поднят
локальный сервер для разработки [browsersync](https://browsersync.io/)

Настройки сервера лежат в файле __bs-config.js__ .

## Lighthouse for local

Запустить сервер: `npm run start` И выполнить комманду `npm run test:lighthouse http://localhost:9000/`

## Комманды

`$ npm run lint:html`
Запускает проверку html файлов из папки public

`$ npm run lint:css`
Запускает проверку css файлов из папки public

`$ npm run lint:js`
Запускает проверку js файлов из папки public

`$ npm run start`
Запускает локальный сервер

`$ npm run start:tunnel`
Запускает локальный сервер и пробрасывает к нему доступ из вне

`$ npm run test`
Запускает все проверки

`$ npm run test:lighthouse <url>`
Запускает проверку сайта на локальном сервере

`$ npm run deploy`
Публикует Ваш сайт на github pages
