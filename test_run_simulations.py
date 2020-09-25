from election_simulator import run_simulations
from time import time
import sys


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise ValueError("Needs to have one argument denoting number of simulations")
    start_time = time()
    run_simulations(num=int(sys.argv[-1]), write=False)
    print("Time needed to run:", time() - start_time)