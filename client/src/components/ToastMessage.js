import { useState, useEffect } from 'react'
import { Toast } from 'flowbite-react'
import { CheckCircleIcon, TrashIcon } from '@heroicons/react/24/solid'

function ToastMessage({ method }) {
  const [showMessage, setShowMessage] = useState('')
  const [showIcon, setShowIcon] = useState('')

  useEffect(() => {
    if (method === 'ADD') {
      setShowMessage('เพิ่มสถานที่สำเร็จ')
      setShowIcon('success')
    } else if (method === 'DEL') {
      setShowMessage('ลบสถานที่สำเร็จ')
      setShowIcon('failure')
    }
  }, [method])

  return (
    <Toast className="m-4 fixed inset-x-0 top-0 z-50">
      {showIcon === 'success' ? (
        <CheckCircleIcon className="h-5 w-5 text-green-600" />
      ) : (
        <TrashIcon className="h-5 w-5 text-red-600" />
      )}
      <div className="ml-3 text-sm font-normal">{showMessage}</div>
      <Toast.Toggle />
    </Toast>
  )
}

export default ToastMessage
