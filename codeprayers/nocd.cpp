#include <iostream>
#include <string.h>

using namespace std;

int ocd(void * k);
int nocd(void * k);

bool stopsign = false;
int ocd(void * k) {
    int * resource = new int;
    int (*kernel)(void *) = (int(*)(void*))k;
    do {
        (*resource)++;
        if (stopsign) {
            kernel = nocd;
        }
        *resource = (*kernel)((int*)(void*)(kernel));
    } while (false);
    int tmp = *resource;
    delete resource;
    return tmp;
}

int nocd(void * k) {
    int resource = 0;
    return resource;
}

int main()
{
    char input[256];
    int (*kernel)(void *) = ocd;
    while (true) {
        cin >> input;
        stopsign = (strcmp(input,"stop")==0);
        cout << (((*kernel)((int*)(void*)(kernel))) == 0 ? ":)" : ":(") << endl;
    }
    return 0;
}
