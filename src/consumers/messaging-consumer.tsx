import * as React from "react"
import {useMessagingUpgrade, MessagingInMemoryMock } from "../hooks/use-messaging-upgrade"

export const MessagingConsumer = () => {
  const messagingState = useMessagingUpgrade(MessagingInMemoryMock())

  React.useEffect(() => {
    console.log("Effect function triggered with:", messagingState.status)
  }, [messagingState.status])

  if (messagingState.status === "loading") {
    return <span>Loading</span>
  }

  if (messagingState.status === "failed") {
    return (
      <div>
        <h2>
          Fetching failed, please retry.
          <button onClick={() => messagingState.retry()}>Retry</button>
        </h2>
      </div>
    )
  }

  if (messagingState.status === "not-active") {
    return (
      <>
        <h2>You have not activated trial period!</h2>
        <div>
          <button disabled={messagingState.transitioning} onClick={() => messagingState.actions.activateTrial()}>
            {messagingState.transitioning ? "Activating Trial" : "Activate Trial"}
          </button>
          {messagingState.error && `Error Happend: ${messagingState.error}`}
        </div>
      </>
    )
  }

  if (messagingState.status === "active-trial") {
    return (
      <div>
        <h2>Your Card is now in trial period, well done!</h2>
      </div>
    )
  }

  return null
}
