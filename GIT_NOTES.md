# Git Notes

## ПРАВИЛО: ВСЕГДА ИСПОЛЬЗОВАТЬ `--no-pager`

**ВСЕГДА вызывать git команды с флагом `--no-pager`**, чтобы избежать зависания в пейджере (less).

Примеры:
- `git --no-pager branch -a`
- `git --no-pager log --oneline`
- `git --no-pager diff`
- `git --no-pager status`

Это правило обязательно для всех git команд, которые могут выводить длинный текст.

## ПРАВИЛО: SSH-КЛЮЧ ДЛЯ GITHUB

При работе с GitHub в этом проекте используется SSH-ключ `~/.ssh/ed_random`.

Настройка прописана в локальном конфиге репозитория (`.git/config`):

```
core.sshCommand = ssh -i ~/.ssh/ed_random
```

- Эта настройка хранится только в `.git/config` проекта и не влияет на другие репозитории.
- Не лазить в глобальный конфиг (`~/.gitconfig`) и `~/.ssh/config`.
- Проверить настройку: `git config --local --get core.sshCommand`
