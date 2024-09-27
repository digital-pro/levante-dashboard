import { 
  getParsedLocale, 
  fetchBuffer, 
  showAndPlaceAudioButton, 
  restoreSurveyData, 
  saveFinalSurveyData,
  saveSurveyData,
} from '@/helpers/survey';

export async function initializeSurvey({
  surveyInstance,
  userType,
  specificSurveyData,
  userData,
  gameStore,
  locale,
  audioLinkMap,
  generalSurveyData,
}) {
  const { isRestored, pageNo } = restoreSurveyData({
    surveyInstance,
    uid: userData.id,
    selectedAdmin: userData.selectedAdminId,
    surveyResponsesData: userData.surveyResponsesData,
  });

  // Store all pages from the survey JSON
  const allGeneralPages = generalSurveyData.pages;
  const allSpecificPages = specificSurveyData?.pages || [];
  gameStore.setAllSurveyPages(allGeneralPages);
  gameStore.setAllSpecificPages(allSpecificPages);

  const numGeneralPages = allGeneralPages.length;
  const numSpecificPages = allSpecificPages.length;
  gameStore.setNumberOfSurveyPages(numGeneralPages, numSpecificPages);

  const specificCount = userType === 'parent' ? userData.childIds.length :
                        userType === 'student' ? 0 : userData.classes.current.length;
  const totalPages = numGeneralPages + (numSpecificPages * specificCount);

  if (isRestored) {
    // Add pages around the restored page number
    const startIndex = Math.max(0, pageNo - 1);
    const endIndex = Math.min(totalPages, pageNo + 2);

    for (let i = startIndex; i < endIndex; i++) {
      addPageToSurvey(surveyInstance, i, userType, userData, gameStore);
    }

    surveyInstance.currentPageNo = 1; // we keep a window of 3 pages so we always want to start from the middle 
    gameStore.setCurrentPageIndex(pageNo);
  } else {
    // Add initial 3 pages manually
    for (let i = 0; i < Math.min(3, totalPages); i++) {
      addPageToSurvey(surveyInstance, i, userType, userData, gameStore);
    }

    gameStore.setCurrentPageIndex(0);
  }


  if (userType === 'student') {
    await setupStudentAudio(surveyInstance, locale, audioLinkMap, gameStore);
  }

  gameStore.setNumberOfSurveyPages(numGeneralPages, numSpecificPages);
}

function addPageToSurvey(surveyInstance, pageIndex, userType, userData, gameStore, isGoingBackward = false) {
  const numGeneralPages = gameStore.numGeneralPages; // 6
  const numSpecificPages = gameStore.numSpecificPages; // 8
  const allGeneralPages = gameStore.allSurveyPages;
  const allSpecificPages = gameStore.allSpecificPages;

  let newPage;
  if (pageIndex < numGeneralPages) {
    // If were going backward, we want to add the page to the beginning of the visiblePages array
    if (isGoingBackward) {
      newPage = surveyInstance.addNewPage(allGeneralPages[pageIndex].name, 0);
    } else {
      newPage = surveyInstance.addNewPage(allGeneralPages[pageIndex].name);
    }
    newPage.fromJSON(allGeneralPages[pageIndex]);
  } else {
    const specificIndex = Math.floor((pageIndex - numGeneralPages) / numSpecificPages); // 1
    const specificPageIndex = (pageIndex - numGeneralPages) % numSpecificPages; //(pageIndex - numGeneralPages) % numSpecificPages
    const prefix = userType === 'parent' ? 'child' : 'class';
    const specificId = userType === 'parent' ? userData.childIds[specificIndex] : userData.classes.current[specificIndex];

    const specificPage = JSON.parse(JSON.stringify(allSpecificPages[specificPageIndex]));
    specificPage.name = `${specificPage.name}_${prefix}${specificIndex + 1}`;
    specificPage.elements.forEach(element => {
      element.name = `${element.name}_${prefix}${specificIndex + 1}_${specificId}`;
    });
    
    if (isGoingBackward) {
      newPage = surveyInstance.addNewPage(specificPage.name, 0);
    } else {
      newPage = surveyInstance.addNewPage(specificPage.name);
    }
    console.log('new specific page: ', newPage);
    newPage.fromJSON(specificPage);
  }
}

async function setupStudentAudio(surveyInstance, locale, audioLinkMap, gameStore) {
  const parsedLocale = getParsedLocale(locale);
  await fetchBuffer({ 
    parsedLocale, 
    setSurveyAudioLoading: gameStore.setSurveyAudioLoading, 
    audioLinks: audioLinkMap, 
    surveyAudioBuffers: gameStore.surveyAudioPlayerBuffers, 
    setSurveyAudioPlayerBuffers: gameStore.setSurveyAudioPlayerBuffers 
  });

  surveyInstance.onAfterRenderPage.add((__, { htmlElement }) => {
    const questionElements = htmlElement.querySelectorAll('div[id^=sq_]');
    if (gameStore.currentSurveyAudioSource) {
      gameStore.currentSurveyAudioSource.stop();
    }
    questionElements.forEach((el) => {
      const playAudioButton = document.getElementById('audio-button-' + el.dataset.name);
      showAndPlaceAudioButton({playAudioButton, el});
    });
  });
}

export function setupSurveyEventHandlers({
  surveyInstance,
  userType,
  roarfirekit,
  uid,
  selectedAdminId,
  gameStore,
  router,
  toast,
  queryClient,
  userData,
}) {
  surveyInstance.onValueChanged.add((sender, options) => 
    saveSurveyData({ 
      survey: sender, 
      roarfirekit, 
      uid, 
      selectedAdmin: selectedAdminId, 
      questionName: options.name, 
      responseValue: options.value,
      userType,
      numGeneralPages: gameStore.numGeneralPages,
      numSpecificPages: gameStore.numSpecificPages,
      gameStore,
      specificIds: userType === 'parent' ? userData.childIds : 
                   userType === 'teacher' ? userData.classes.current : 
                   [],
      saveSurveyResponses: roarfirekit.saveSurveyResponses
    })
  );

  surveyInstance.onCurrentPageChanging.add((sender, options) => {
    const currentPageIndex = gameStore.currentPageIndex;
    // console.log('current page index: ', currentPageIndex);
    const numGeneralPages = gameStore.numGeneralPages;
    const numSpecificPages = gameStore.numSpecificPages;
    const specificCount = userType === 'parent' ? userData.childIds.length :
                          userType === 'student' ? 0 : userData.classes.current.length;
    const totalPages = numGeneralPages + (numSpecificPages * specificCount);

    // console.log('pages before: ', sender.pages);

    if (options.isGoingForward && (currentPageIndex + 2 <= totalPages) && currentPageIndex !== 0) {
      // Add next page
      const nextPageIndex = currentPageIndex + 2;
      addPageToSurvey(sender, nextPageIndex, userType, userData, gameStore);

      // Remove first page
      surveyInstance.removePage(surveyInstance.pages[0]);

    } else if (options.isGoingBackward && currentPageIndex - 2 >= 0) {
      // Add previous page
      const prevPageIndex = currentPageIndex - 2;
      addPageToSurvey(sender, prevPageIndex, userType, userData, gameStore, options.isGoingBackward);

      // Remove last page
      surveyInstance.removePage(surveyInstance.pages[surveyInstance.pages.length - 1]);
    }

    if (options.isGoingForward) {
      gameStore.setCurrentPageIndex(currentPageIndex + 1);
    } else if (options.isGoingBackward) {
      gameStore.setCurrentPageIndex(currentPageIndex - 1);
    }

    // console.log('pages after: ', sender.pages);
  });

  surveyInstance.onComplete.add((sender) => 
    saveFinalSurveyData({ 
      sender, 
      roarfirekit, 
      uid, 
      gameStore, 
      router, 
      toast, 
      queryClient,
      specificIds: userType === 'parent' ? userData.childIds : 
                   userType === 'teacher' ? userData.classes.current : 
                   [],
    })
  );
}
