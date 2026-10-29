'use client';

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { EditorContent as TiptapContent, useEditor, type Editor as TiptapEditor } from '@tiptap/react';
import type { Extensions } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  SquareCode,
  Strikethrough,
  Undo2,
  Unlink,
  Upload,
} from 'lucide-react';
import { cx } from '../utils/cx';
import { dataAttr } from '../utils/dom';
import { Button } from './Button';
import { isSafeHref, SAFE_LINK_PROTOCOLS } from '../utils/url';
import { proseClassName, type JSONContent } from './EditorViewer';
import { Input } from './Input';
import { Popover } from './Popover';
import styles from './Editor.module.css';

export type { JSONContent };

/**
 * Набор узлов документа. EditorViewer умеет рендерить ровно их;
 * добавляете расширение здесь — добавьте его рендер в EditorViewer.
 */
export function getEditorExtensions(): Extensions {
  return [
    StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
    Link.configure({
      openOnClick: false,
      autolink: true,
      protocols: SAFE_LINK_PROTOCOLS,
      isAllowedUri: (url) => isSafeHref(url),
      HTMLAttributes: { rel: 'noopener noreferrer nofollow', target: '_blank' },
    }),
    Image.configure({ inline: false, allowBase64: false }),
  ];
}

export interface EditorProps {
  /** Controlled-документ в Tiptap JSON. */
  value?: JSONContent;
  defaultValue?: JSONContent;
  onChange?: (value: JSONContent, editor: TiptapEditor) => void;
  placeholder?: string;
  /** Лимит символов (с показом счётчика). */
  maxLength?: number;
  editable?: boolean;
  /** Показать панель инструментов. */
  toolbar?: boolean;
  /** Загрузка картинки с компьютера: верните URL загруженного файла. Без него — только вставка по ссылке. */
  onImageUpload?: (file: File) => Promise<string>;
  minHeight?: number | string;
  invalid?: boolean;
  className?: string;
  id?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

function ToolButton({
  label,
  icon,
  active,
  disabled,
  onClick,
}: {
  label: string;
  icon: ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      size="sm"
      variant="ghost"
      iconOnly
      icon={icon}
      aria-label={label}
      title={label}
      aria-pressed={active}
      data-active={dataAttr(active)}
      className={styles.tool}
      disabled={disabled}
      // не уводим фокус из редактора, чтобы выделение не терялось
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
    />
  );
}

function LinkControl({ editor }: { editor: TiptapEditor }) {
  const [open, setOpen] = useState(false);
  const [href, setHref] = useState('');
  const [error, setError] = useState<string>();
  const active = editor.isActive('link');

  const onOpenChange = (next: boolean) => {
    if (next) {
      setHref((editor.getAttributes('link').href as string | undefined) ?? '');
      setError(undefined);
    }
    setOpen(next);
  };

  const apply = (event: FormEvent) => {
    event.preventDefault();
    const value = href.trim();
    if (!value) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      setOpen(false);
      return;
    }
    if (!isSafeHref(value)) {
      setError('Ссылка должна начинаться с http://, https://, mailto: или /');
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: value }).run();
    setOpen(false);
  };

  return (
    <Popover
      open={open}
      onOpenChange={onOpenChange}
      placement="bottom-start"
      trigger={
        <Button
          size="sm"
          variant="ghost"
          iconOnly
          icon={<LinkIcon />}
          aria-label="Ссылка"
          title="Ссылка"
          aria-pressed={active}
          data-active={dataAttr(active)}
          className={styles.tool}
          onMouseDown={(event) => event.preventDefault()}
        />
      }
    >
      <form className={styles.popoverForm} onSubmit={apply}>
        <Input
          size="sm"
          autoFocus
          placeholder="https://example.com"
          aria-label="Адрес ссылки"
          aria-invalid={error ? true : undefined}
          value={href}
          onChange={(event) => {
            setHref(event.target.value);
            setError(undefined);
          }}
        />
        {error && <p className={styles.formError}>{error}</p>}
        <div className={styles.popoverActions}>
          {active && (
            <Button
              size="sm"
              variant="ghost"
              icon={<Unlink />}
              onClick={() => {
                editor.chain().focus().extendMarkRange('link').unsetLink().run();
                setOpen(false);
              }}
            >
              Убрать
            </Button>
          )}
          <Button size="sm" variant="primary" type="submit">
            Применить
          </Button>
        </div>
      </form>
    </Popover>
  );
}

function ImageControl({ editor, onImageUpload }: { editor: TiptapEditor; onImageUpload?: (file: File) => Promise<string> }) {
  const [open, setOpen] = useState(false);
  const [src, setSrc] = useState('');
  const [error, setError] = useState<string>();
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const insert = (url: string) => {
    editor.chain().focus().setImage({ src: url }).run();
    setSrc('');
    setOpen(false);
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const value = src.trim();
    if (!/^https?:\/\//i.test(value) && !value.startsWith('/')) {
      setError('Укажите адрес картинки, начинающийся с http:// или https://');
      return;
    }
    insert(value);
  };

  const onFile = async (file: File | undefined) => {
    if (!file || !onImageUpload) return;
    setUploading(true);
    setError(undefined);
    try {
      insert(await onImageUpload(file));
    } catch {
      setError('Не удалось загрузить файл. Попробуйте ещё раз.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button
          size="sm"
          variant="ghost"
          iconOnly
          icon={<ImageIcon />}
          aria-label="Картинка"
          title="Картинка"
          className={styles.tool}
          onMouseDown={(event) => event.preventDefault()}
        />
      }
    >
      <form className={styles.popoverForm} onSubmit={onSubmit}>
        <Input
          size="sm"
          autoFocus
          placeholder="https://example.com/image.png"
          aria-label="Адрес картинки"
          aria-invalid={error ? true : undefined}
          value={src}
          onChange={(event) => {
            setSrc(event.target.value);
            setError(undefined);
          }}
        />
        {error && <p className={styles.formError}>{error}</p>}
        <div className={styles.popoverActions}>
          {onImageUpload && (
            <>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(event) => void onFile(event.target.files?.[0])}
              />
              <Button size="sm" variant="ghost" icon={<Upload />} loading={uploading} onClick={() => fileRef.current?.click()}>
                С компьютера
              </Button>
            </>
          )}
          <Button size="sm" variant="primary" type="submit">
            Вставить
          </Button>
        </div>
      </form>
    </Popover>
  );
}

function Toolbar({ editor, onImageUpload }: { editor: TiptapEditor; onImageUpload?: (file: File) => Promise<string> }) {
  const chain = () => editor.chain().focus();
  return (
    <div className={styles.toolbar} role="toolbar" aria-label="Форматирование">
      <ToolButton label="Отменить" icon={<Undo2 />} disabled={!editor.can().undo()} onClick={() => chain().undo().run()} />
      <ToolButton label="Повторить" icon={<Redo2 />} disabled={!editor.can().redo()} onClick={() => chain().redo().run()} />
      <span className={styles.divider} />
      <ToolButton label="Заголовок 1" icon={<Heading1 />} active={editor.isActive('heading', { level: 1 })} onClick={() => chain().toggleHeading({ level: 1 }).run()} />
      <ToolButton label="Заголовок 2" icon={<Heading2 />} active={editor.isActive('heading', { level: 2 })} onClick={() => chain().toggleHeading({ level: 2 }).run()} />
      <ToolButton label="Заголовок 3" icon={<Heading3 />} active={editor.isActive('heading', { level: 3 })} onClick={() => chain().toggleHeading({ level: 3 }).run()} />
      <span className={styles.divider} />
      <ToolButton label="Жирный" icon={<Bold />} active={editor.isActive('bold')} onClick={() => chain().toggleBold().run()} />
      <ToolButton label="Курсив" icon={<Italic />} active={editor.isActive('italic')} onClick={() => chain().toggleItalic().run()} />
      <ToolButton label="Зачёркнутый" icon={<Strikethrough />} active={editor.isActive('strike')} onClick={() => chain().toggleStrike().run()} />
      <ToolButton label="Код" icon={<Code />} active={editor.isActive('code')} onClick={() => chain().toggleCode().run()} />
      <LinkControl editor={editor} />
      <span className={styles.divider} />
      <ToolButton label="Маркированный список" icon={<List />} active={editor.isActive('bulletList')} onClick={() => chain().toggleBulletList().run()} />
      <ToolButton label="Нумерованный список" icon={<ListOrdered />} active={editor.isActive('orderedList')} onClick={() => chain().toggleOrderedList().run()} />
      <ToolButton label="Цитата" icon={<Quote />} active={editor.isActive('blockquote')} onClick={() => chain().toggleBlockquote().run()} />
      <ToolButton label="Блок кода" icon={<SquareCode />} active={editor.isActive('codeBlock')} onClick={() => chain().toggleCodeBlock().run()} />
      <ToolButton label="Разделитель" icon={<Minus />} onClick={() => chain().setHorizontalRule().run()} />
      <ImageControl editor={editor} onImageUpload={onImageUpload} />
    </div>
  );
}

/**
 * Текстовый редактор на Tiptap. Клиентский по природе; при SSR рендерит пустую рамку нужной высоты,
 * редактор монтируется после гидратации (`immediatelyRender: false`).
 * Для показа сохранённого документа без редактора используйте серверный `EditorContent`.
 */
export function Editor({
  value,
  defaultValue,
  onChange,
  placeholder = 'Начните писать…',
  maxLength,
  editable = true,
  toolbar = true,
  onImageUpload,
  minHeight = 160,
  invalid = false,
  className,
  id,
  'aria-label': ariaLabel = 'Текстовый редактор',
  'aria-describedby': ariaDescribedBy,
}: EditorProps) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const editor = useEditor({
    extensions: [
      ...getEditorExtensions(),
      Placeholder.configure({ placeholder }),
      CharacterCount.configure({ limit: maxLength ?? null }),
    ],
    content: value ?? defaultValue,
    editable,
    immediatelyRender: false,
    onUpdate: ({ editor: instance }) => onChangeRef.current?.(instance.getJSON(), instance),
    editorProps: {
      attributes: {
        class: cx(proseClassName, styles.content),
        role: 'textbox',
        'aria-multiline': 'true',
        'aria-label': ariaLabel,
        ...(id ? { id } : null),
        ...(ariaDescribedBy ? { 'aria-describedby': ariaDescribedBy } : null),
        ...(invalid ? { 'aria-invalid': 'true' } : null),
      },
    },
  });

  // controlled-режим: подтягиваем внешнее значение, не сбивая курсор при собственных правках
  useEffect(() => {
    if (!editor || value === undefined) return;
    if (JSON.stringify(editor.getJSON()) !== JSON.stringify(value)) {
      editor.commands.setContent(value, false);
    }
  }, [editor, value]);

  useEffect(() => {
    editor?.setEditable(editable);
  }, [editor, editable]);

  const count = editor?.storage.characterCount?.characters?.() as number | undefined;

  return (
    <div
      className={cx(styles.root, className)}
      data-invalid={dataAttr(invalid)}
      data-readonly={dataAttr(!editable)}
      style={{ ['--editor-min-height' as string]: typeof minHeight === 'number' ? `${minHeight}px` : minHeight }}
    >
      {toolbar && editable && (editor ? <Toolbar editor={editor} onImageUpload={onImageUpload} /> : <div className={styles.toolbarPlaceholder} />)}
      {editor ? <TiptapContent editor={editor} className={styles.mount} /> : <div className={cx(proseClassName, styles.content)} aria-hidden="true" data-editor-pending="" />}
      {maxLength !== undefined && (
        <div className={styles.footer}>
          <span data-limit={dataAttr(count !== undefined && count >= maxLength)}>
            {count ?? 0} / {maxLength}
          </span>
        </div>
      )}
    </div>
  );
}
