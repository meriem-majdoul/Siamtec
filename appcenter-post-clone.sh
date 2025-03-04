
if [ “$APPCENTER_BRANCH” == “production” ] || [ “$1” == “prod” ];
then
echo “Switching to Firebase Production environment”
  yes | cp -rf firebase-environements/production/google-services.json android
  echo “YES”

#   yes | cp -rf “firebase-environements/production/GoogleService-Info.plist” ios
elif [ “$1” == “dev” ]
then
  echo “Switching to Firebase Dev environment [Development]”
  yes | cp -rf firebase-environements/development/google-services.json android
#   yes | cp -rf “firebase-environements/development/GoogleService-Info.plist” ios
# then
#   echo “ID\tFIREBASE PROJECT”
#   echo “production\tmy-app-production”
#   echo “susan\tmy-app-susan”
#   echo “john\tmy-app-john”
else
  echo “Run ‘appcenter-post-clone.sh envs’ to list available environments.”
fi