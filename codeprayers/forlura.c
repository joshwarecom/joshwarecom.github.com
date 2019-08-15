#include <stdio.h>
#include <time.h>
#include <stdlib.h>
#include <string.h>

typedef struct {
char strength;
char energy;
} prayerResult;

prayerResult prayerForLura() {
int gathered;
srand(time(0));

//first, make sure 2 or 3 are gathered in jesusName
char * jesusName = (char*)malloc(((gathered=(rand() % 2)+2))*6);

prayerResult yes;
// "The answer to every Christian prayer is Yes." - Dr. Timothy Wengert

for (int i = 0; i < gathered; i++) {
strcpy(jesusName,"jesus");
//obtain maximum prayer result one iteration at a time.
for (char j = 0; (j+1)>0;j++) {
yes.energy = j;
yes.strength = j;
}
}
free(jesusName); //never leave a consecrated host just lying around, even when it's allocated from random access memory.

return yes;
}

int main() {
prayerResult x = prayerForLura();
printf("Maximum strength level: %d, prayer result: %d\n", (int)(sizeof(x.strength)*128)-1, x.strength);
printf("Maximum energy level: %d, prayer result: %d\n", (int)(sizeof(x.energy)*128)-1, x.energy);
printf("Total prayer efficiency: %f %%",(float)((sizeof(x)*128)-2)/(float)(x.energy+x.strength)*100);
}
