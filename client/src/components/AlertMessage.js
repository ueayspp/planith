import { Alert } from 'flowbite-react'
import { InformationCircleIcon } from '@heroicons/react/24/solid'

function AlertMessage({ message, color }) {
  return (
    <Alert className="m-4 fixed inset-x-0 top-0 z-50" color={color} icon={InformationCircleIcon}>
      <span className="font-medium">{message}</span>
    </Alert>
  )
}

export default AlertMessage
