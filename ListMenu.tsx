import {useState} from 'react'
import {Divider, IconButton, Menu} from 'react-native-paper'
import ConfirmDialog from './ConfirmDialog'
import useDark from './use-dark'

export default function ListMenu({
  onEdit,
  onCopy,
  onClear,
  onDelete,
  onSelect,
  ids,
}: {
  onEdit: () => void
  onCopy: () => void
  onClear: () => void
  onDelete: () => void
  onSelect: () => void
  ids?: number[]
}) {
  const [showMenu, setShowMenu] = useState(false)
  const [showRemove, setShowRemove] = useState(false)
  const dark = useDark()

  const edit = () => {
    setShowMenu(false)
    onEdit()
  }

  const copy = () => {
    setShowMenu(false)
    onCopy()
  }

  const clear = () => {
    setShowMenu(false)
    onClear()
  }

  const remove = () => {
    setShowMenu(false)
    setShowRemove(false)
    onDelete()
  }

  const select = () => {
    setShowMenu(false)
    onSelect()
  }

  return (
    <Menu
      visible={showMenu}
      onDismiss={() => setShowMenu(false)}
      anchor={
        <IconButton
          color={dark ? 'white' : 'white'}
          onPress={() => setShowMenu(true)}
          icon="more-vert"
        />
      }>
      <Menu.Item icon="done-all" title="Select all" onPress={select} />
      <Menu.Item
        icon="clear"
        title="Clear"
        onPress={clear}
        disabled={ids?.length === 0}
      />
      <Menu.Item
        icon="edit"
        title="Edit"
        onPress={edit}
        disabled={ids?.length === 0}
      />
      <Menu.Item
        icon="content-copy"
        title="Copy"
        onPress={copy}
        disabled={ids?.length === 0}
      />
      <Divider />
      <Menu.Item
        icon="delete"
        onPress={() => setShowRemove(true)}
        title="Delete"
      />
      <ConfirmDialog
        title={ids?.length === 0 ? 'Delete all' : 'Delete selected'}
        show={showRemove}
        setShow={setShowRemove}
        onOk={remove}
        onCancel={() => setShowMenu(false)}>
        {ids?.length === 0 ? (
          <>This irreversibly deletes records from the app. Are you sure?</>
        ) : (
          <>This will delete {ids?.length} record(s). Are you sure?</>
        )}
      </ConfirmDialog>
    </Menu>
  )
}
