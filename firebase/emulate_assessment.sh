PREVIOUS_DIR=$(pwd)
cd firebase/assessment
# firebase use --clear
# firebase use demo-gse-roar-assessment
firebase emulators:start --project demo-gse-roar-assessment --import export-20230910-122923UTC &
cd $PREVIOUS_DIR