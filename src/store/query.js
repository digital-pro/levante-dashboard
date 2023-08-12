import { Firestore } from "firebase/firestore";
import { defineStore, storeToRefs } from "pinia";
import { getUniquePropsFromUsers } from "../helpers/index.js";
import { getRunTrials, getTasks, getUserRuns, getTasksVariants } from "@bdelab/roar-firekit";
import { useAuthStore } from "@/store/auth"

export const useQueryStore = () => {
  const authStore = useAuthStore();
  const { roarfirekit } = storeToRefs(authStore);
  return defineStore({
    id: "queryStore",
    state: () => {
      return {
        activeTab: 0,
        allVariants: [],
        endDate: null,
        percentCompleteRuns: 0,
        percentCompleteTrials: 0,
        rootDocs: {},
        runs: [],
        runsReady: false,
        selectedClasses: [],
        selectedDistricts: [],
        selectedRootPath: null,
        selectedRuns: [],
        selectedSchools: [],
        selectedStudies: [],
        selectedTasks: [],
        selectedTrials: [],
        selectedUsers: [],
        selectedVariants: [],
        startDate: null,
        tasks: [],
        tasksReady: false,
        trialColumns: [],
        trials: [],
        trialsReady: false,
        users: [],
        usersReady: false,
        variantsReady: false,
      };
    },
    getters: {
      selectedTaskIds: (state) => state.selectedTasks.map((task) => task.id),
      selectedVariantIds: (state) => state.selectedVariants.map((variant) => variant.id),
      variants: (state) => state.allVariants.filter((taskGroup) => state.selectedTaskIds.includes(taskGroup.task)),
      districts: (state) => getUniquePropsFromUsers(state.users, "districts"),
      schools: (state) => getUniquePropsFromUsers(state.users, "schools"),
      classes: (state) => getUniquePropsFromUsers(state.users, "classes"),
      studies: (state) => getUniquePropsFromUsers(state.users, "studies"),
      nRuns: (state) => state.runs.length,
      nTrials: (state) => state.trials.length,
      runTasks: (state) => [...new Set(state.runs.map((run) => run.task.id))].map((id) => ({ id })),
      runVariants: (state) => [...new Set(state.runs.map((run) => run.variant.id))].map((id) => ({ id })),
      runDistricts: (state) => [...new Set(state.runs.map((run) => run.district.id))].map((id) => ({ id })),
      runSchools: (state) => [...new Set(state.runs.map((run) => run.school.id))].map((id) => ({ id })),
      runClasses: (state) => [...new Set(state.runs.map((run) => run.class.id))].map((id) => ({ id })),
      runStudies: (state) => [...new Set(state.runs.map((run) => run.study.id))].map((id) => ({ id })),
    },
    actions: {
      async getTasks(requireRegistered = true) {
        this.tasksReady = false;
        if (roarfirekit.value?.app?.db) {
          this.tasks = await roarfirekit.value.getTasks(requireRegistered)
        } else {
          this.tasks = []
        }
        this.tasksReady = true;
      },
      async getVariants(requireRegistered = true) {
        this.variantsReady = false;
        if (roarfirekit.value?.app?.db) {
          console.log("getting variants", roarfirekit.value);
          this.allVariants = await roarfirekit.value.getTasksVariants(requireRegistered);
        } else {
          console.log("Setting all variants to empty array")
          this.allVariants = [];
        }
        this.variantsReady = true;
      },
      async getRuns() {
        this.activeTab = 1;

        this.runsReady = false;
        this.percentCompleteRuns = 0
        const percentIncrement = 100 / this.selectedUsers.length;

        this.runs = [];

        for (const user of this.selectedUsers) {
          const filters = {
            districts: this.selectedDistricts,
            schools: this.selectedSchools,
            classes: this.selectedClasses,
            studies: this.selectedStudies
          }
          const usersRuns = await getUserRuns(this.selectedRootDoc, user, filters, this.selectedTaskIds, this.selectedVariantIds);
          this.runs.push(...usersRuns);
          this.percentCompleteRuns = Math.min(100, this.percentCompleteRuns + percentIncrement);
        }

        this.runsReady = true;
        this.percentCompleteRuns = 0;
      },
      async getTrials() {
        this.activeTab = 2;

        this.trialsReady = false;
        this.percentCompleteTrials = 0
        const percentIncrement = 100 / this.selectedRuns.length;

        this.trials = [];
        const trialColumns = [];

        for (const run of this.selectedRuns) {
          const runTrials = await getRunTrials(this.selectedRootDoc, run);
          this.trials.push(...runTrials);
          trialColumns.push(runTrials.map((trial) => Object.keys(trial)).flat())

          this.trialColumns = [...new Set(trialColumns)].map((key) => ({
            field: key, header: key,
          }))
          this.percentCompleteTrials = Math.min(100, this.percentCompleteTrials + percentIncrement);
        }

        this.trialsReady = true;
        this.percentCompleteTrials = 0;
      },
    },
  })();
};
