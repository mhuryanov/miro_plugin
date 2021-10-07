miro.onReady(() => {
    const icon24 = '<image xlink:href="data:;base64,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" width="140" height="114" />'  
  
    miro.initialize({
      extensionPoints: {
        toolbar: {
          title: 'widget counter',
          svgIcon: icon24,
          onClick: () => {
            miro.board.ui.openLeftSidebar('sidebar.html')
          },
        },
      },
    })
  })