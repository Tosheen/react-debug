import * as React from "react"
import { useQuery, useMutation, useQueryClient } from "react-query"

type MessagingPorts = {
  getMessagingUpgradeStatus: () => Promise<MessagingUpgradeState>
  activateTrial: () => Promise<MessagingUpgradeState>
}

type MessagingUpgradeNotActiveState = {
  status: "not-active"
}

type MessagingUpgradeTrialState = {
  status: "active-trial"
  expiresAt: Date
}

type MessagingUpgradeState = MessagingUpgradeNotActiveState | MessagingUpgradeTrialState

type MessagingUpgradeViewState =
  | {
      status: "loading"
    }
  | {
      status: "failed"
      retry: () => void
      error: string
    }
  | (MessagingUpgradeNotActiveState & {
      transitioning: boolean
      actions: {
        activateTrial: () => void
      }
      error: string | null
    })
  | (MessagingUpgradeTrialState)


export const useMessagingUpgrade = (ports: MessagingPorts): MessagingUpgradeViewState => {
  const queryClient = useQueryClient()

  const { isLoading, data, isError, error } = useQuery(
    "message-upgrade",
    ports.getMessagingUpgradeStatus,
    {
      retry: 1,
    },
  )

  const [counter, setCounter] = React.useState<number | null>(null)

  const retry = () => {
    queryClient.invalidateQueries("message-upgrade")
  }

  const activateTrialMutation = useMutation(ports.activateTrial, {
    onSuccess: (result) => {
      queryClient.setQueryData("message-upgrade", result)
      setCounter(null)
    },
  })

  const activateTrial = () => {
    activateTrialMutation.mutate()
  }

  if(isLoading) {
    return {
      status: "loading"
    }
  } else {
    if(isError) {
      return {
        status: "failed",
        retry,
        error: error instanceof Error ? error.message : "unknown error"
      }
    }

    if(data) {
      if(data.status === "not-active") {
        return {
          status: "not-active",
          actions: {
            activateTrial
          },
          transitioning: activateTrialMutation.isLoading,
          error: activateTrialMutation.error && activateTrialMutation.error instanceof Error ? activateTrialMutation.error.message : null
        }
      } else if (data.status === "active-trial") {
        return {
          status: "active-trial",
          expiresAt: data.expiresAt
        }
      }
    }
  }
  
  return {
    status: "loading"
  }
}

const sleep = (timeout: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout)
  })
}

export const MessagingInMemoryMock = (): MessagingPorts => {
  const getMessagingUpgradeStatus = async () => {
    await sleep(1000)

     return {
      status: "not-active" as const,
    }
  }

  const activateTrial = async () => {
    await sleep(1000) 
    
    return {
      status: "active-trial" as const,
      expiresAt: new Date(new Date().getTime() + 4 * 86400 * 1000), //generate date 3 days a head
    }
  }

  return {
    getMessagingUpgradeStatus,
    activateTrial
  }
}
