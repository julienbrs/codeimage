import {createStoreNotifier} from '@codeimage/store/plugins/store-notifier';
import {createUniqueId, versionateId} from '@codeimage/store/plugins/unique-id';
import {
  createStore as $createStore,
  Reducer,
  select,
  withProps,
} from '@ngneat/elf';
import {debounceTime, distinctUntilChanged, map} from 'rxjs';
import {
  batch,
  createEffect,
  createRoot,
  createSelector,
  createSignal,
  onCleanup,
  onMount,
} from 'solid-js';
import {createStore, unwrap} from 'solid-js/store';
import {appEnvironment} from '../core/configuration';
import {SUPPORTED_FONTS} from '../core/configuration/font';
import shallow from '../core/helpers/shallow';
import {useIdb} from '../hooks/use-indexed-db';

export interface TabsState {
  readonly tabId: string;
  readonly tabName: string | null;
  readonly tabIcon?: string;
}

export interface EditorState {
  readonly id: string;
  readonly languageId: string;
  readonly code: string;
  readonly fontId: string;
  readonly fontWeight: number;
  readonly showLineNumbers: boolean;
  readonly focused: boolean;
  readonly tabIcon?: string;
}

const initialState: Omit<EditorState, 'id'> = {
  code: appEnvironment.defaultState.editor.code,
  languageId: appEnvironment.defaultState.editor.languageId,
  showLineNumbers: false,
  fontId: appEnvironment.defaultState.editor.font.id,
  fontWeight: appEnvironment.defaultState.editor.font.types[0].weight,
  focused: false,
};

type IndexedDbState = {
  readonly editors: readonly EditorState[];
  readonly tabs: readonly TabsState[];
  readonly themeId: string;
};

function $createEditors() {
  const idb = useIdb();
  const [, withNotifier, onChange$] = createStoreNotifier();
  // TODO: Fix initial state sync
  const initialId = createUniqueId();
  const [$activeEditorId, $setActiveEditorId] = createSignal<string>(initialId);
  const [$themeId, $setThemeId] = createSignal<string>(
    appEnvironment.defaultState.editor.theme.id,
  );
  const [ready, setReady] = createSignal(false);
  const $isActive = createSelector($activeEditorId);

  const [tabs, setTabs] = createStore<TabsState[]>([
    {tabName: 'index.tsx', tabId: initialId},
  ]);
  const [editors, setEditors] = createStore<EditorState[]>([
    {...initialState, id: initialId},
  ]);

  createEffect(() => console.log($activeEditorId()));

  onMount(() => {
    idb
      .get<IndexedDbState>('$editor')
      .then(result => {
        if (!result) return;
        batch(() => {
          const tabs = result.tabs.map(tab => ({
            ...tab,
            tabId: versionateId(tab.tabId),
          }));
          $setActiveEditorId(tabs[0].tabId ?? null);
          $setThemeId(result.themeId);
          setTabs(tabs);
          setEditors(
            result.editors.map(editor => ({
              ...editor,
              id: versionateId(editor.id),
            })),
          );
        });
      })
      .then(() => {
        setReady(true);
        const sub = onChange$.pipe(debounceTime(100)).subscribe(() => {
          const state: IndexedDbState = {editors, tabs, themeId: $themeId()};
          idb.set('$editor', unwrap(state));
        });
        onCleanup(() => sub.unsubscribe());
      });
  });

  const setActiveEditor = withNotifier((editor: EditorState) =>
    $setActiveEditorId(editor.id),
  );

  const addEditor = withNotifier(
    (state?: Partial<EditorState> | null, active?: boolean) =>
      batch(() => {
        const id = createUniqueId();
        const editor = {...initialState, ...(state ?? {}), id};
        setEditors(editors => [...editors, editor]);
        setTabs(tabs => [...tabs, {tabName: null, tabId: id}]);
        if (active) setActiveEditor(editor);
      }),
  );

  const removeEditor = withNotifier((id: string) => {
    if (editors.length === 1) {
      return;
    }
    const isActive = $isActive(id);
    setEditors(editors => editors.filter(editor => editor.id !== id));
    setTabs(tabs => tabs.filter(tab => tab.tabId !== id));
    // Side effect?
    if (isActive) {
      const previousEditor = editors[editors.length - 1];
      setActiveEditor(previousEditor ?? editors[0]);
    }
  });

  const setTabName = withNotifier((id: string, name: string) =>
    setTabs(
      tabs.findIndex(tab => tab.tabId === id),
      tab => ({
        ...tab,
        tabName: name,
      }),
    ),
  );

  return {
    tabs,
    editors,
    isActive: $isActive,
    removeEditor,
    setActiveEditor,
    addEditor,
    setTabName,
    setEditors,
    setTabs,
    themeId: $themeId,
    setThemeId: $setThemeId,
    ready,
  } as const;
}

const $rootEditorState = createRoot($createEditors);

export function getRootEditorsState() {
  return $rootEditorState;
}

const store = $createStore(
  {name: 'editor'},
  // TODO: to replace with new editor store
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  withProps<EditorState>(initialState),
);

export const updateEditorStore = (value: Reducer<EditorState>) =>
  store.update(value);

function $activeEditors() {
  const {editors, setEditors, isActive, themeId} = $rootEditorState;
  const currentEditor = () => editors.find(editor => isActive(editor.id));

  const currentEditorIndex = () =>
    editors.findIndex(editor => editor.id === currentEditor()?.id);

  const setFocused = (focused: boolean) =>
    setEditors(currentEditorIndex(), 'focused', focused);

  const setFontId = (fontId: string) =>
    setEditors(currentEditorIndex(), 'fontId', fontId);

  const setFontWeight = (fontWeight: number) =>
    setEditors(currentEditorIndex(), 'fontWeight', fontWeight);

  const setLanguageId = (languageId: string) =>
    setEditors(currentEditorIndex(), 'languageId', languageId);

  const setShowLineNumbers = (showLineNumbers: boolean) =>
    setEditors(currentEditorIndex(), 'showLineNumbers', showLineNumbers);

  const setCode = (code: string) =>
    setEditors(currentEditorIndex(), 'code', code);

  return {
    editor: currentEditor,
    setFocused,
    setFontId,
    setFontWeight,
    setLanguageId,
    setShowLineNumbers,
    setCode,
    themeId,
  };
}

const $activeEditorState = createRoot($activeEditors);

export function getActiveEditorState() {
  return $activeEditorState;
}

export const editor$ = store.pipe(distinctUntilChanged(shallow));

const fontId$ = editor$.pipe(select(store => store.fontId));

export const editorLanguageId$ = editor$.pipe(
  select(store => store.languageId),
);

export const font$ = fontId$.pipe(
  map(id => SUPPORTED_FONTS.find(font => font.id === id)),
);

export const focusedEditor$ = editor$.pipe(select(store => store.focused));
